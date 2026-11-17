import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/server.js";
import { redact } from "../src/safety.js";
import { speechText, twilioSignature } from "../src/voice.js";
import { buildSystemPrompt, loadBusinesses, voiceGreeting } from "../src/businesses.js";
import { faqReply } from "../src/faq.js";

const quiet = { error() {}, warn() {}, log() {} };

// Fake Claude: replies from a script of responses, recording each request.
function fakeClient(script) {
  const calls = [];
  return {
    calls,
    beta: { messages: { create: async (req) => { calls.push(structuredClone(req)); const r = script.shift(); if (!r) throw new Error("no more"); return r; } } },
  };
}
const text = (t) => ({ stop_reason: "end_turn", content: [{ type: "text", text: t }] });
const tool = (name, input, id = "tu_1") => ({ stop_reason: "tool_use", content: [{ type: "tool_use", id, name, input }] });

async function start(opts = {}) {
  const server = createApp({ dataFile: null, adminPassword: "pw", log: quiet, ...opts });
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const json = async (path, body, headers = {}) => {
    const r = await fetch(base + path, body ? { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) } : { headers });
    return { status: r.status, body: await r.json() };
  };
  const twilio = async (path, params, headers = {}) => {
    const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", ...headers }, body: new URLSearchParams(params) });
    return { status: r.status, xml: await r.text() };
  };
  return { server, base, json, twilio, close: () => server.close() };
}

test("every spoken greeting discloses the AI assistant", () => {
  for (const b of Object.values(loadBusinesses("businesses"))) {
    assert.match(voiceGreeting(b), /المساعد الذكي التابع/);
    assert.ok(voiceGreeting(b).includes(b.name));
    const p = buildSystemPrompt(b, "voice");
    assert.match(p, /لست إنساناً/);
    assert.match(p, /اللهجة الكويتية/);
  }
});

test("offline mode answers 'are you a bot?' honestly without handing off", () => {
  const b = loadBusinesses("businesses").restaurant;
  const r = faqReply(b, "انت انسان ولا بوت؟");
  assert.match(r.text, /مساعد ذكي/);
  assert.ok(!r.handoff);
  assert.ok(faqReply(b, "ابي اكلم موظف").handoff);
});

test("redacts card numbers and OTP codes", () => {
  const r = redact("بطاقتي 4111 1111 1111 1111 والرمز ٤٥٦٧٨٩");
  assert.ok(!r.text.includes("4111 1111"));
  assert.match(r.text, /1111\]/);
  assert.ok(!r.text.includes("456789"));
  assert.deepEqual(r.found.sort(), ["card", "secret"]);
  assert.equal(redact("طلبي رقم 12345").found.length, 0);
});

test("speechText strips symbols for the phone voice", () => {
  assert.equal(speechText("أهلاً 🍢\n• كباب: 3 د.ك\n**عرض**"), "أهلاً. كباب: 3 د.ك. عرض");
});

test("chat: Claude reply and reservation tool", async () => {
  const client = fakeClient([
    tool("create_reservation", { customer_name: "أحمد", phone: "55555555", date: "2026-11-20", time: "20:00", party_size: 4, notes: "" }),
    text("تم تسجيل حجزك."),
  ]);
  const app = await start({ client });
  try {
    const c = await app.json("/api/conversations", { businessId: "restaurant" });
    const r = await app.json(`/api/conversations/${c.body.id}/messages`, { text: "ابي احجز طاولة لاربعة" });
    assert.equal(r.body.lines.at(-1).text, "تم تسجيل حجزك.");
    // second request carries the tool result back
    const last = client.calls[1].messages.at(-1);
    assert.equal(last.content[0].type, "tool_result");
    assert.match(last.content[0].content, /reservation_reference/);
    const ov = await app.json("/api/admin/overview", null, { authorization: "Bearer pw" });
    assert.equal(ov.body.reservations.length, 1);
    assert.equal((await app.json("/api/admin/overview")).status, 401);
  } finally { app.close(); }
});

test("phone call: greeting, a turn, and goodbye with hang-up", async () => {
  const client = fakeClient([text("نفتح من الساعة ١٢ الظهر 🙂"), tool("end_call", {}), text("مع السلامة!")]);
  const app = await start({ client });
  try {
    const inc = await app.twilio("/voice/incoming?b=cafe", { CallSid: "CA1", From: "+96555500000", To: "+965222" });
    assert.match(inc.xml, /<Gather input="dtmf speech" numDigits="1" language="ar-KW"/);
    assert.match(inc.xml, /For English, press 2/);
    assert.match(inc.xml, /المساعد الذكي التابع لـكافيه حبة بن/);
    const cid = inc.xml.match(/c=([\w-]+)/)[1];

    const t1 = await app.twilio(`/voice/turn?c=${cid}`, { CallSid: "CA1", SpeechResult: "متى تفتحون" });
    assert.match(t1.xml, /<Say voice="Polly.Hala-Neural">نفتح من الساعة ١٢ الظهر<\/Say>/);
    assert.match(t1.xml, /<Gather/);
    // caller number goes to the model with the first message only
    assert.match(client.calls[0].messages[0].content, /\+96555500000/);
    assert.ok(client.calls[0].tools.some((t) => t.name === "end_call"));

    const t2 = await app.twilio(`/voice/turn?c=${cid}`, { CallSid: "CA1", SpeechResult: "شكراً مع السلامة" });
    assert.match(t2.xml, /مع السلامة!<\/Say><Hangup\/>/);
  } finally { app.close(); }
});

test("phone call: hand-off transfers to staff number when set, else books a callback", async () => {
  const client = fakeClient([tool("handoff_to_human", { reason: "يبي موظف", priority: "normal" }), text("أكيد، أحولك الحين لموظف.")]);
  const app = await start({ client });
  try {
    const inc = await app.twilio("/voice/incoming?b=company", { CallSid: "CA2", From: "+96599999999" });
    const cid = inc.xml.match(/c=([\w-]+)/)[1];
    const t = await app.twilio(`/voice/turn?c=${cid}`, { CallSid: "CA2", SpeechResult: "ابي اكلم موظف" });
    assert.match(t.xml, /<Hangup\/>/); // no transferTo configured in the sample → callback ticket
    const ov = await app.json("/api/admin/overview", null, { authorization: "Bearer pw" });
    assert.equal(ov.body.tickets[0].phone, "+96599999999");
  } finally { app.close(); }
});

test("phone call: silence twice reprompts, third time hangs up", async () => {
  const app = await start({});
  try {
    const inc = await app.twilio("/voice/incoming?b=bank", { CallSid: "CA3" });
    const cid = inc.xml.match(/c=([\w-]+)/)[1];
    assert.match((await app.twilio(`/voice/turn?c=${cid}`, {})).xml, /ممكن تعيد/);
    assert.match((await app.twilio(`/voice/turn?c=${cid}`, {})).xml, /ممكن تعيد/);
    assert.match((await app.twilio(`/voice/turn?c=${cid}`, {})).xml, /<Hangup\/>/);
  } finally { app.close(); }
});

test("Twilio signature is required when an auth token is set", async () => {
  const app = await start({ twilioAuthToken: "secret", publicUrl: "https://example.com" });
  try {
    const params = { CallSid: "CA4", From: "+1" };
    assert.equal((await app.twilio("/voice/incoming?b=cafe", params)).status, 403);
    const sig = twilioSignature("secret", "https://example.com/voice/incoming?b=cafe", params);
    const ok = await app.twilio("/voice/incoming?b=cafe", params, { "x-twilio-signature": sig });
    assert.equal(ok.status, 200);
    assert.match(ok.xml, /<Gather/);
  } finally { app.close(); }
});

test("bank call: spoken card number is masked and warned about", async () => {
  const client = fakeClient([text("حاضر، خلني أساعدك.")]);
  const app = await start({ client });
  try {
    const inc = await app.twilio("/voice/incoming?b=bank", { CallSid: "CA5" });
    const cid = inc.xml.match(/c=([\w-]+)/)[1];
    const t = await app.twilio(`/voice/turn?c=${cid}`, { SpeechResult: "رقم بطاقتي 4111111111111111" });
    assert.match(t.xml, /لا تشارك رقم البطاقة/);
    assert.ok(!JSON.stringify(client.calls[0].messages).includes("4111111111111111"));
  } finally { app.close(); }
});

test("prompt forbids invented information and lists the five languages", () => {
  const p = buildSystemPrompt(loadBusinesses("businesses").bank, "voice");
  assert.match(p, /عدم الاختراع/);
  assert.match(p, /لا تخترع أي معلومة أبداً/);
  for (const l of ["English", "Hindi", "Filipino", "Urdu", "اللهجة الكويتية"]) assert.ok(p.includes(l), l);
});

test("phone call: pressing 2 switches to English with an English AI disclosure", async () => {
  const client = fakeClient([text("We open at twelve noon.")]);
  const app = await start({ client });
  try {
    const inc = await app.twilio("/voice/incoming?b=restaurant", { CallSid: "CA6" });
    const cid = inc.xml.match(/c=([\w-]+)/)[1];
    const pick = await app.twilio(`/voice/turn?c=${cid}`, { Digits: "2" });
    assert.match(pick.xml, /language="en-US"/);
    assert.match(pick.xml, /Polly.Joanna-Neural">Hi, this is Sara, the AI assistant for Bait Al Shuwa Restaurant/);
    const t = await app.twilio(`/voice/turn?c=${cid}`, { SpeechResult: "When do you open?" });
    assert.match(t.xml, /Joanna-Neural">We open at twelve noon/);
    assert.match(client.calls[0].messages[0].content, /\[لغة المكالمة: English\]/);
  } finally { app.close(); }
});

test("phone call: set_language switches speech recognition and voice to Urdu", async () => {
  const client = fakeClient([tool("set_language", { language: "ur" }), text("جی، میں اردو میں بات کر سکتی ہوں۔")]);
  const app = await start({ client });
  try {
    const inc = await app.twilio("/voice/incoming?b=company", { CallSid: "CA7" });
    const cid = inc.xml.match(/c=([\w-]+)/)[1];
    const t = await app.twilio(`/voice/turn?c=${cid}`, { SpeechResult: "ممكن تتكلم اردو" });
    assert.match(t.xml, /Google.ur-IN-Standard-A">جی/);
    assert.match(t.xml, /language="ur-PK"/);
  } finally { app.close(); }
});

test("offline Hindi caller gets an honest 'no info' answer, never invented content", async () => {
  const app = await start({});
  try {
    const inc = await app.twilio("/voice/incoming?b=cafe", { CallSid: "CA8" });
    const cid = inc.xml.match(/c=([\w-]+)/)[1];
    await app.twilio(`/voice/turn?c=${cid}`, { Digits: "3" });
    const t = await app.twilio(`/voice/turn?c=${cid}`, { SpeechResult: "कॉफ़ी कितने की है?" });
    assert.match(t.xml, /पक्की जानकारी नहीं/);
  } finally { app.close(); }
});

test("offline: 'are you a real person?' gets an honest AI answer in each language", async () => {
  const app = await start({});
  try {
    for (const [digit, q, expect] of [["2", "are you a real person?", /AI assistant, not a person/], ["4", "tao ka ba?", /AI assistant po ako/], ["5", "کیا آپ انسان ہیں؟", /AI اسسٹنٹ ہوں/]]) {
      const inc = await app.twilio("/voice/incoming?b=cafe", { CallSid: "CB" + digit });
      const cid = inc.xml.match(/c=([\w-]+)/)[1];
      await app.twilio(`/voice/turn?c=${cid}`, { Digits: digit });
      const t = await app.twilio(`/voice/turn?c=${cid}`, { SpeechResult: q });
      assert.match(t.xml, expect);
      assert.match(t.xml, /<Gather/); // no hang-up, no transfer
    }
  } finally { app.close(); }
});
