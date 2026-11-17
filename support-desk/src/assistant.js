// The customer-service brain: Claude with three tools (ticket, reservation,
// hand-off to a human). Falls back to offline FAQ answers when the API is not
// configured or a request fails, so customers always get a reply.
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./businesses.js";
import { faqReply } from "./faq.js";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const MAX_TOOL_ROUNDS = 5;

const TOOL_DEFS = {
  create_ticket: {
    name: "create_ticket",
    description:
      "Record a complaint, follow-up request or problem for the business team (e.g. late order, damaged shipment, card dispute). Use once you have a clear description and a way to contact the customer. Returns a ticket reference to give the customer.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        category: { type: "string", enum: ["complaint", "follow_up", "refund", "dispute", "suggestion", "other"] },
        summary: { type: "string", description: "Short description of the issue in the customer's language." },
        reference: { type: "string", description: "Order / shipment / transaction reference if given, else empty string." },
        customer_name: { type: "string" },
        phone: { type: "string", description: "Customer contact number, or empty string." },
        priority: { type: "string", enum: ["low", "normal", "high", "urgent"] },
      },
      required: ["category", "summary", "reference", "customer_name", "phone", "priority"],
    },
  },
  create_reservation: {
    name: "create_reservation",
    description:
      "Request a table reservation. Call only after the customer has given name, phone, date, time and party size. The branch confirms it later; tell the customer it is pending confirmation and give the reference.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        customer_name: { type: "string" },
        phone: { type: "string" },
        date: { type: "string", description: "Date as YYYY-MM-DD." },
        time: { type: "string", description: "24h time as HH:MM." },
        party_size: { type: "integer" },
        notes: { type: "string", description: "Seating preference, occasion, allergies, or empty string." },
      },
      required: ["customer_name", "phone", "date", "time", "party_size", "notes"],
    },
  },
  end_call: {
    name: "end_call",
    description: "Hang up the phone call. Use only after the caller has said goodbye or confirmed they need nothing else, and after your short goodbye sentence.",
    strict: true,
    input_schema: { type: "object", additionalProperties: false, properties: {}, required: [] },
  },
  handoff_to_human: {
    name: "handoff_to_human",
    description:
      "Transfer the conversation to a human agent. Use when the customer asks for a person, is very upset, the issue needs account access or judgement you cannot give, or fraud is suspected. After this, say one short sentence: on a chat that a team member will reply here; on a phone call that you are transferring them to a staff member.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        reason: { type: "string" },
        priority: { type: "string", enum: ["normal", "high", "urgent"] },
      },
      required: ["reason", "priority"],
    },
  },
};

export function toolsFor(business, channel = "chat") {
  const tools = [TOOL_DEFS.create_ticket, TOOL_DEFS.handoff_to_human];
  if ((business.features || []).includes("reservations")) tools.splice(1, 0, TOOL_DEFS.create_reservation);
  if (channel === "voice") tools.push(TOOL_DEFS.end_call);
  return tools;
}

export function createAssistant({ store, client, log = console }) {
  const aiEnabled = Boolean(client);
  const systemCache = new Map();
  const systemFor = (b, channel) => {
    const key = b.id + ":" + channel;
    if (!systemCache.has(key)) systemCache.set(key, buildSystemPrompt(b, channel));
    return systemCache.get(key);
  };

  function runTool(name, input, business, convo) {
    if (name === "create_ticket") {
      const t = store.addTicket({ businessId: business.id, conversationId: convo.id, ...input });
      return { ok: true, ticket_reference: t.id };
    }
    if (name === "create_reservation" && (business.features || []).includes("reservations")) {
      const r = store.addReservation({ businessId: business.id, conversationId: convo.id, ...input });
      return { ok: true, reservation_reference: r.id, status: "pending_confirmation" };
    }
    if (name === "end_call") {
      convo.endCall = true;
      return { ok: true };
    }
    if (name === "handoff_to_human") {
      convo.status = "human";
      convo.handoff = { reason: input.reason, priority: input.priority, at: new Date().toISOString() };
      store.addLine(convo, "system", `تم التحويل لموظف — ${input.reason}`);
      return { ok: true, note: convo.channel === "voice" ? "The call will be transferred to a staff member (or a callback arranged) right after your next sentence." : "A human agent will continue in this chat." };
    }
    return { ok: false, error: "unknown tool" };
  }

  async function askClaude(business, convo) {
    const msgs = convo.apiMessages;
    const startLen = msgs.length;
    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const response = await client.beta.messages.create({
          model: MODEL,
          max_tokens: 16000,
          output_config: { effort: "low" }, // chat: fast, short answers
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default", // another model answers if this one declines
          system: [{ type: "text", text: systemFor(business, convo.channel), cache_control: { type: "ephemeral" } }],
          tools: toolsFor(business, convo.channel),
          messages: msgs,
        });

        if (response.stop_reason === "refusal") {
          msgs.length = startLen;
          runTool("handoff_to_human", { reason: "Assistant could not answer this request", priority: "normal" }, business, convo);
          return "عذراً، ما أقدر أساعد في هذا الطلب. حوّلت محادثتك لأحد الموظفين.";
        }

        msgs.push({ role: "assistant", content: response.content });

        if (response.stop_reason === "pause_turn") continue;
        const toolUses = response.content.filter((b) => b.type === "tool_use");
        if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
          const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
          return text || "تمام 👍";
        }

        const results = toolUses.map((tu) => {
          let out;
          try { out = runTool(tu.name, tu.input, business, convo); }
          catch (e) { out = { ok: false, error: String(e.message || e) }; }
          return { type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(out), is_error: !out.ok };
        });
        msgs.push({ role: "user", content: results });
      }
      throw new Error("too many tool rounds");
    } catch (err) {
      msgs.length = startLen; // drop a half-finished turn so history stays valid
      throw err;
    }
  }

  // Handle one customer message; returns the bot reply text, or null when a
  // human agent owns the conversation.
  async function handleCustomerMessage(business, convo, text) {
    // On calls, tell the model the caller's number once, in the first message.
    const first = convo.apiMessages.length === 0 && convo.channel === "voice" && convo.caller;
    convo.apiMessages.push({ role: "user", content: first ? `[مكالمة واردة من الرقم ${convo.caller}]\n${text}` : text });
    if (convo.status !== "bot") return null;

    let reply;
    if (aiEnabled) {
      try {
        reply = await askClaude(business, convo);
      } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) log.error("Claude API: invalid credentials");
        else if (err instanceof Anthropic.RateLimitError) log.error("Claude API: rate limited");
        else if (err instanceof Anthropic.APIError) log.error(`Claude API error ${err.status}: ${err.message}`);
        else log.error("Assistant error:", err);
      }
    }
    if (!reply) {
      const fb = faqReply(business, text);
      if (fb.handoff) runTool("handoff_to_human", { reason: "طلب العميل التحدث مع موظف", priority: "normal" }, business, convo);
      reply = fb.text;
      convo.apiMessages.push({ role: "assistant", content: reply });
    }
    return reply;
  }

  // A human agent's reply is added to the model's history so the bot knows
  // what was said if the conversation is handed back.
  function recordAgentReply(convo, text) {
    if (convo.apiMessages.length === 0) convo.apiMessages.push({ role: "user", content: "(بدأ العميل المحادثة)" });
    convo.apiMessages.push({ role: "assistant", content: `(رد من موظف خدمة العملاء) ${text}` });
  }

  return { aiEnabled, handleCustomerMessage, recordAgentReply };
}
