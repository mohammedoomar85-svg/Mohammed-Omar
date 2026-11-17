// Phone calls through Twilio Programmable Voice.
// Twilio turns the caller's speech into text (<Gather input="speech">), we ask
// the assistant, and Twilio reads the answer back (<Say>).
//
// The call opens in Arabic with the AI disclosure and a short language menu:
// Arabic callers just talk; others press 2 English, 3 Hindi, 4 Filipino, 5 Urdu.
// The assistant can also switch language mid-call (set_language tool).
//
// Twilio console → Phone Numbers → your number → "A call comes in":
//   Webhook  POST  https://YOUR-DOMAIN/voice/incoming?b=restaurant
// and "Call status changes":  POST  https://YOUR-DOMAIN/voice/status
import crypto from "node:crypto";
import { voiceGreeting } from "./businesses.js";
import { LANG_CODES, langFor } from "./languages.js";
import { redact } from "./safety.js";

const FIRST_WAIT_MS = 2500;   // answer directly if the assistant is this fast
const WAIT_STEP_MS = 9000;    // otherwise say a filler and poll again
const SPOKEN_BANK_WARNING = {
  ar: "تنبيه: لا تشارك رقم البطاقة أو الرقم السري أو رمز التحقق مع أي أحد، حتى لو قال إنه من البنك. إذا شاركته، غيّره فوراً من التطبيق.",
  en: "Warning: never share your card number, PIN or verification code with anyone, even someone saying they are from the bank. If you did, change it now in the app.",
  hi: "सावधान: अपना कार्ड नंबर, पिन या OTP किसी को न बताएं, चाहे वो बैंक से होने का दावा करे। अगर बता दिया है, तो ऐप से तुरंत बदलें।",
  fil: "Paalala po: huwag ibigay ang card number, PIN o OTP kahit kanino, kahit sabihin nilang taga-bangko sila. Kung naibigay na, palitan agad sa app.",
  ur: "خبردار: اپنا کارڈ نمبر، پن یا OTP کسی کو نہ بتائیں، چاہے وہ بینک سے ہونے کا دعویٰ کرے۔ اگر بتا دیا ہے تو ایپ سے فوراً تبدیل کریں۔",
};

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

export const enabledLanguages = (b) => (b.voice?.enabledLanguages || LANG_CODES).filter((c) => LANG_CODES.includes(c));

export function createVoice({ businesses, store, assistant, withLock, publicUrl, twilioAuthToken, log = console }) {
  const pending = new Map(); // conversation id -> Promise<reply>

  const say = (b, lang, text) => {
    if (!text) return "";
    const L = langFor(b, lang);
    return `<Say voice="${xml(L.tts)}"${L.sayLang ? ` language="${xml(L.sayLang)}"` : ""}>${xml(speechText(text))}</Say>`;
  };
  const gather = (b, c, inner = "", { menu = false } = {}) =>
    `<Gather input="${menu ? "dtmf speech" : "speech"}"${menu ? ' numDigits="1"' : ""} language="${xml(langFor(b, c.lang).stt)}" ` +
    `speechTimeout="auto" actionOnEmptyResult="true" action="/voice/turn?c=${c.id}" method="POST">${inner}</Gather>`;
  const twiml = (body) => `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;
  const race = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(undefined), ms))]);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function close(c, note) {
    if (c.status !== "closed") { c.status = "closed"; store.addLine(c, "system", note); }
  }

  // Opening: Arabic AI disclosure, then each other language's menu line in its own voice.
  function opening(b, c) {
    const langs = enabledLanguages(b);
    if (langs.length <= 1 || !langs.includes("ar")) {
      c.lang = langs[0] || "ar";
      return { text: voiceGreeting(b, c.lang), xml: gather(b, c, say(b, c.lang, voiceGreeting(b, c.lang))) };
    }
    const ar = `${voiceGreeting(b, "ar")} ${langFor(b, "ar").menu}`;
    const others = langs.filter((l) => l !== "ar");
    const inner = say(b, "ar", ar) + others.map((l) => say(b, l, langFor(b, l).menu)).join("");
    return { text: [ar, ...others.map((l) => langFor(b, l).menu)].join(" "), xml: gather(b, c, inner, { menu: true }) };
  }

  // What to tell Twilio after the assistant has answered.
  function afterReply(b, c, reply) {
    const L = langFor(b, c.lang);
    let out = say(b, c.lang, reply);
    if (c.status === "human") {
      const transferTo = b.voice?.transferTo || "";
      if (transferTo) {
        store.addLine(c, "system", `تم تحويل المكالمة إلى ${transferTo}`);
        return twiml(out + `<Dial timeout="25">${xml(transferTo)}</Dial>` + say(b, c.lang, L.noAgent) + "<Hangup/>");
      }
      store.addTicket({
        businessId: b.id, conversationId: c.id, category: "follow_up", priority: c.handoff?.priority || "normal",
        summary: `طلب اتصال من موظف (${L.label}): ` + (c.handoff?.reason || ""), reference: "", customer_name: "", phone: c.caller || "",
      });
      close(c, "انتهت المكالمة — سُجّل طلب معاودة اتصال");
      return twiml(out + say(b, c.lang, L.callback) + "<Hangup/>");
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
      c.lang = c.lang || "ar";
      const o = opening(b, c);
      if (!c.transcript.length) { store.addLine(c, "bot", o.text); c.unread = false; }
      return reply(200, twiml(o.xml));
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
    c.lang = c.lang || "ar";

    if (url.pathname === "/voice/turn") {
      // Language picked from the menu with the keypad
      if (params.Digits) {
        const lang = enabledLanguages(b).find((l) => langFor(b, l).digit === params.Digits);
        if (lang) {
          c.lang = lang;
          store.addLine(c, "system", `اختار المتصل اللغة: ${langFor(b, lang).label}`);
          const greet = voiceGreeting(b, lang); // AI disclosure again, in the chosen language
          store.addLine(c, "bot", greet);
          return reply(200, twiml(gather(b, c, say(b, lang, greet))));
        }
        return reply(200, twiml(gather(b, c, say(b, c.lang, langFor(b, c.lang).pardon))));
      }

      const heard = String(params.SpeechResult || "").trim();
      if (!heard) {
        c.silence = (c.silence || 0) + 1;
        const L = langFor(b, c.lang);
        if (c.silence >= 3) {
          close(c, "انتهت المكالمة — لا يوجد رد من المتصل");
          return reply(200, twiml(say(b, c.lang, L.bye) + "<Hangup/>"));
        }
        return reply(200, twiml(gather(b, c, say(b, c.lang, L.pardon))));
      }
      c.silence = 0;
      const job = withLock(c.id, async () => {
        const r = redact(heard);
        store.addLine(c, "customer", r.text);
        const warn = r.found.length && b.sector === "bank" ? (SPOKEN_BANK_WARNING[c.lang] || SPOKEN_BANK_WARNING.ar) + " " : "";
        if (warn) store.addLine(c, "bot", warn);
        const text = await assistant.handleCustomerMessage(b, c, r.text);
        if (text) store.addLine(c, "bot", text);
        store.touch(c);
        return warn + (text || "");
      }).catch((err) => { log.error("voice turn failed:", err); return langFor(b, c.lang).sorry; });
      pending.set(c.id, job);
      const done = await race(job, FIRST_WAIT_MS);
      if (done !== undefined) { pending.delete(c.id); return reply(200, afterReply(b, c, done)); }
      return reply(200, twiml(say(b, c.lang, pick(langFor(b, c.lang).wait)) + `<Redirect method="POST">/voice/wait?c=${c.id}</Redirect>`));
    }

    if (url.pathname === "/voice/wait") {
      const job = pending.get(c.id);
      if (!job) return reply(200, twiml(gather(b, c)));
      const done = await race(job, WAIT_STEP_MS);
      if (done === undefined) return reply(200, twiml(say(b, c.lang, pick(langFor(b, c.lang).wait)) + `<Redirect method="POST">/voice/wait?c=${c.id}</Redirect>`));
      pending.delete(c.id);
      return reply(200, afterReply(b, c, done));
    }

    return reply(404, twiml("<Hangup/>"));
  }

  return { handle };
}
