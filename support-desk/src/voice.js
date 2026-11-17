// Phone calls through Twilio Programmable Voice.
// Twilio turns the caller's speech into text (<Gather input="speech">), we ask
// the assistant, and Twilio reads the answer back (<Say>) in an Arabic voice.
//
// Twilio console → Phone Numbers → your number → "A call comes in":
//   Webhook  POST  https://YOUR-DOMAIN/voice/incoming?b=restaurant
// and "Call status changes":  POST  https://YOUR-DOMAIN/voice/status
import crypto from "node:crypto";
import { voiceGreeting } from "./businesses.js";
import { redact } from "./safety.js";

const FIRST_WAIT_MS = 2500;   // answer directly if the assistant is this fast
const WAIT_STEP_MS = 9000;    // otherwise say a filler and poll again
const FILLERS = ["لحظة من فضلك.", "ثواني بس.", "خلني أشيك لك.", "لحظات."];
const SPOKEN_BANK_WARNING =
  "تنبيه: لا تشارك رقم البطاقة أو الرقم السري أو رمز التحقق مع أي أحد، حتى لو قال إنه من البنك. إذا شاركته، غيّره فوراً من التطبيق.";

const xml = (s) => String(s).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]);

// Make text safe and natural to read aloud.
export function speechText(s) {
  return String(s || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, "")
    .replace(/^[\s•\-*#]+/gm, "")
    .replace(/[*_#`[\]()]/g, "")
    .replace(/\s*\n+\s*/g, ". ")
    .replace(/\s{2,}/g, " ")
    .replace(/(\.\s*){2,}/g, ". ")
    .trim();
}

// https://www.twilio.com/docs/usage/security#validating-requests
export function twilioSignature(authToken, url, params) {
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  return crypto.createHmac("sha1", authToken).update(Buffer.from(data, "utf8")).digest("base64");
}

export function createVoice({ businesses, store, assistant, withLock, publicUrl, twilioAuthToken, log = console }) {
  const pending = new Map(); // conversation id -> Promise<reply>

  const settings = (b) => ({
    language: b.voice?.language || "ar-KW",
    tts: b.voice?.ttsVoice || "Polly.Hala-Neural",
    transferTo: b.voice?.transferTo || "",
  });
  const say = (b, text) => (text ? `<Say voice="${xml(settings(b).tts)}">${xml(speechText(text))}</Say>` : "");
  const gather = (b, c, inner = "") =>
    `<Gather input="speech" language="${xml(settings(b).language)}" speechTimeout="auto" actionOnEmptyResult="true" ` +
    `action="/voice/turn?c=${c.id}" method="POST">${inner}</Gather>`;
  const twiml = (body) => `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;
  const race = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(undefined), ms))]);

  function close(c, note) {
    if (c.status !== "closed") { c.status = "closed"; store.addLine(c, "system", note); }
  }

  // What to tell Twilio after the assistant has answered.
  function afterReply(b, c, reply) {
    let out = say(b, reply);
    if (c.status === "human") {
      const { transferTo } = settings(b);
      if (transferTo) {
        store.addLine(c, "system", `تم تحويل المكالمة إلى ${transferTo}`);
        return twiml(out + `<Dial timeout="25">${xml(transferTo)}</Dial>` +
          say(b, "عذراً، ما قدرنا نوصلك لموظف الحين. سجلنا طلبك وراح نتصل فيك بأقرب وقت.") + "<Hangup/>");
      }
      store.addTicket({
        businessId: b.id, conversationId: c.id, category: "follow_up", priority: c.handoff?.priority || "normal",
        summary: "طلب اتصال من موظف: " + (c.handoff?.reason || ""), reference: "", customer_name: "", phone: c.caller || "",
      });
      close(c, "انتهت المكالمة — سُجّل طلب معاودة اتصال");
      return twiml(out + say(b, "سجلت طلبك، وراح يتصل فيك أحد الموظفين على نفس الرقم بأقرب وقت. مع السلامة.") + "<Hangup/>");
    }
    if (c.endCall) {
      close(c, "أنهى المساعد المكالمة");
      return twiml(out + "<Hangup/>");
    }
    return twiml(gather(b, c, out));
  }

  async function handle(req, res, url, params) {
    const reply = (code, body) => { res.writeHead(code, { "content-type": "text/xml; charset=utf-8" }); res.end(body); };

    if (twilioAuthToken) {
      const expected = twilioSignature(twilioAuthToken, publicUrl + url.pathname + url.search, params);
      const got = String(req.headers["x-twilio-signature"] || "");
      if (got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
        return reply(403, twiml("<Reject/>"));
      }
    }

    if (url.pathname === "/voice/incoming") {
      const b = businesses[url.searchParams.get("b")] ||
        Object.values(businesses).find((x) => x.voice?.phoneNumber && x.voice.phoneNumber === params.To);
      if (!b) return reply(200, twiml("<Reject/>"));
      const c = store.findByCallSid(params.CallSid) ||
        store.createConversation(b.id, { channel: "voice", caller: params.From || null, callSid: params.CallSid || null });
      if (!c.transcript.length) { store.addLine(c, "bot", voiceGreeting(b)); c.unread = false; }
      return reply(200, twiml(gather(b, c, say(b, voiceGreeting(b)))));
    }

    if (url.pathname === "/voice/status") {
      const c = params.CallSid && store.findByCallSid(params.CallSid);
      if (c && ["completed", "busy", "failed", "no-answer", "canceled"].includes(params.CallStatus)) {
        if (c.status === "bot") close(c, `انتهت المكالمة (${params.CallDuration || 0} ثانية)`);
        else store.addLine(c, "system", `انتهت المكالمة (${params.CallDuration || 0} ثانية)`);
      }
      return reply(204, "");
    }

    const c = store.getConversation(url.searchParams.get("c") || "");
    if (!c || c.channel !== "voice") return reply(200, twiml("<Hangup/>"));
    const b = businesses[c.businessId];

    if (url.pathname === "/voice/turn") {
      const heard = String(params.SpeechResult || "").trim();
      if (!heard) {
        c.silence = (c.silence || 0) + 1;
        if (c.silence >= 3) {
          close(c, "انتهت المكالمة — لا يوجد رد من المتصل");
          return reply(200, twiml(say(b, "ما وصلني صوتك. تقدر تتصل فينا مرة ثانية بأي وقت. مع السلامة.") + "<Hangup/>"));
        }
        return reply(200, twiml(gather(b, c, say(b, "ما سمعتك زين، ممكن تعيد؟"))));
      }
      c.silence = 0;
      const job = withLock(c.id, async () => {
        const r = redact(heard);
        store.addLine(c, "customer", r.text);
        const warn = r.found.length && b.sector === "bank" ? SPOKEN_BANK_WARNING + " " : "";
        if (warn) store.addLine(c, "bot", warn);
        const text = await assistant.handleCustomerMessage(b, c, r.text);
        if (text) store.addLine(c, "bot", text);
        store.touch(c);
        return warn + (text || "");
      }).catch((err) => { log.error("voice turn failed:", err); return "عذراً، صار عندي خلل بسيط. ممكن تعيد طلبك؟"; });
      pending.set(c.id, job);
      const done = await race(job, FIRST_WAIT_MS);
      if (done !== undefined) { pending.delete(c.id); return reply(200, afterReply(b, c, done)); }
      const filler = FILLERS[Math.floor(Math.random() * FILLERS.length)];
      return reply(200, twiml(say(b, filler) + `<Redirect method="POST">/voice/wait?c=${c.id}</Redirect>`));
    }

    if (url.pathname === "/voice/wait") {
      const job = pending.get(c.id);
      if (!job) return reply(200, twiml(gather(b, c)));
      const done = await race(job, WAIT_STEP_MS);
      if (done === undefined) return reply(200, twiml(say(b, "لحظات.") + `<Redirect method="POST">/voice/wait?c=${c.id}</Redirect>`));
      pending.delete(c.id);
      return reply(200, afterReply(b, c, done));
    }

    return reply(404, twiml("<Hangup/>"));
  }

  return { handle };
}
