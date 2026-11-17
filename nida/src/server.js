import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { createStore } from "./store.js";
import { loadBusinesses, publicProfile, voiceGreeting } from "./businesses.js";
import { createAssistant, MODEL } from "./assistant.js";
import { redact } from "./safety.js";
import { createVoice } from "./voice.js";
import { LANG_CODES } from "./languages.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_MESSAGE = 1000;
const PER_MINUTE = 20;

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
const STATIC = { "/": "index.html", "/chat": "chat.html", "/call": "call.html", "/admin": "admin.html", "/widget.js": "widget.js" };

const BANK_WARNING =
  "⚠️ تنبيه أمني: لا تشارك رقم البطاقة كاملاً أو الرقم السري أو رمز التحقق (OTP) مع أي أحد، حتى لو قال إنه من البنك. تم إخفاء الرقم من المحادثة. إذا شاركته مع أحد، غيّره فوراً من التطبيق.";

export function createApp({
  businessesDir = path.join(ROOT, "businesses"),
  dataFile = path.join(ROOT, "data", "db.json"),
  adminPassword = process.env.ADMIN_PASSWORD || "admin123",
  client,
  publicUrl = process.env.PUBLIC_URL || "",
  twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "",
  log = console,
} = {}) {
  const businesses = loadBusinesses(businessesDir);
  const store = createStore(dataFile);
  const assistant = createAssistant({ store, client, log });
  const locks = new Map();      // conversation id -> promise chain (one reply at a time)
  const hits = new Map();       // ip -> [timestamps]

  const withLock = (id, fn) => {
    const next = (locks.get(id) || Promise.resolve()).then(fn, fn);
    locks.set(id, next.catch(() => {}));
    return next;
  };
  const limited = (ip) => {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
    arr.push(now); hits.set(ip, arr);
    return arr.length > PER_MINUTE;
  };
  const voice = createVoice({ businesses, store, assistant, withLock: (id, fn) => withLock(id, fn), publicUrl, twilioAuthToken, log });
  const isAdmin = (req) => {
    const got = Buffer.from((req.headers.authorization || "").replace(/^Bearer /, ""));
    const want = Buffer.from(adminPassword);
    return got.length === want.length && crypto.timingSafeEqual(got, want);
  };

  const send = (res, code, body) => {
    res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify(body));
  };
  const readBody = (req) => new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 50_000) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => resolve(raw));
  });
  const readJson = (req) => new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 20_000) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("bad json")); } });
  });
  // Customers never see internal system notes (hand-off reasons etc.).
  const lines = (c, since = 0) => c.transcript.slice(since).filter((l) => l.role !== "system");

  async function handle(req, res) {
    const url = new URL(req.url, "http://x");
    const p = url.pathname.replace(/\/+$/, "") || "/";

    // ---------- phone calls (Twilio webhooks) ----------
    if (p.startsWith("/voice/") && req.method === "POST") {
      const params = Object.fromEntries(new URLSearchParams(await readBody(req)));
      return voice.handle(req, res, url, params);
    }
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;

    if (req.method === "GET" && STATIC[p]) {
      const file = path.join(ROOT, "public", STATIC[p]);
      res.writeHead(200, { "content-type": MIME[path.extname(file)], "cache-control": "no-cache" });
      return fs.createReadStream(file).pipe(res);
    }

    // ---------- customer API ----------
    if (req.method === "GET" && p === "/api/businesses") {
      return send(res, 200, Object.values(businesses).map(publicProfile));
    }
    if (req.method === "POST" && p === "/api/conversations") {
      const { businessId, channel, lang } = await readJson(req);
      const b = businesses[businessId];
      if (!b) return send(res, 404, { error: "unknown business" });
      if (limited(ip)) return send(res, 429, { error: "rate limited" });
      // channel "voice" here is the in-browser call simulator
      const c = store.createConversation(b.id, { channel: channel === "voice" ? "voice" : "chat" });
      if (c.channel === "voice") c.lang = LANG_CODES.includes(lang) ? lang : "ar";
      store.addLine(c, "bot", c.channel === "voice" ? voiceGreeting(b, c.lang) : b.welcome);
      c.unread = false;
      return send(res, 201, { id: c.id, status: c.status, lang: c.lang || null, lines: lines(c), business: publicProfile(b) });
    }
    let m = p.match(/^\/api\/conversations\/([\w-]+)(\/messages)?$/);
    if (m) {
      const c = store.getConversation(m[1]);
      if (!c) return send(res, 404, { error: "not found" });
      const b = businesses[c.businessId];
      if (req.method === "GET" && !m[2]) {
        const since = Math.max(0, parseInt(url.searchParams.get("since") || "0", 10) || 0);
        return send(res, 200, { status: c.status, total: c.transcript.length, lines: lines(c, since) });
      }
      if (req.method === "POST" && m[2]) {
        if (limited(ip)) return send(res, 429, { error: "كثرة رسائل، حاول بعد دقيقة." });
        const body = await readJson(req);
        let text = String(body.text || "").trim().slice(0, MAX_MESSAGE);
        if (!text) return send(res, 400, { error: "empty" });
        if (c.status === "closed") { c.status = "bot"; }
        const before = c.transcript.length;
        await withLock(c.id, async () => {
          const r = redact(text);
          store.addLine(c, "customer", r.text);
          if (r.found.length && b.sector === "bank") store.addLine(c, "bot", BANK_WARNING);
          const reply = await assistant.handleCustomerMessage(b, c, r.text);
          if (reply) store.addLine(c, "bot", reply);
          store.touch(c);
        });
        return send(res, 200, { status: c.status, lang: c.lang || null, ended: Boolean(c.endCall), total: c.transcript.length, lines: lines(c, before) });
      }
    }

    // ---------- admin API ----------
    if (p.startsWith("/api/admin/")) {
      if (!isAdmin(req)) return send(res, 401, { error: "unauthorized" });
      const bid = url.searchParams.get("b") || undefined;
      if (req.method === "GET" && p === "/api/admin/overview") {
        const convos = store.listConversations(bid).filter((c) => c.transcript.some((l) => l.role === "customer"));
        return send(res, 200, {
          aiEnabled: assistant.aiEnabled, model: assistant.aiEnabled ? MODEL : null,
          businesses: Object.values(businesses).map(publicProfile),
          conversations: convos.map((c) => ({
            id: c.id, businessId: c.businessId, channel: c.channel || "chat", caller: c.caller || null, lang: c.lang || null, status: c.status, unread: c.unread, handoff: c.handoff || null,
            updatedAt: c.updatedAt, count: c.transcript.length, last: c.transcript.at(-1)?.text?.slice(0, 120) || "",
          })),
          tickets: store.listTickets(bid),
          reservations: store.listReservations(bid),
        });
      }
      m = p.match(/^\/api\/admin\/conversations\/([\w-]+)(?:\/(reply|status))?$/);
      if (m) {
        const c = store.getConversation(m[1]);
        if (!c) return send(res, 404, { error: "not found" });
        if (req.method === "GET" && !m[2]) { c.unread = false; store.touch(c); return send(res, 200, { ...c, apiMessages: undefined }); }
        const body = await readJson(req);
        if (req.method === "POST" && m[2] === "reply") {
          const text = String(body.text || "").trim().slice(0, 2000);
          if (!text) return send(res, 400, { error: "empty" });
          await withLock(c.id, async () => {
            c.status = "human";
            store.addLine(c, "agent", text);
            assistant.recordAgentReply(c, text);
          });
          return send(res, 200, { ok: true });
        }
        if (req.method === "POST" && m[2] === "status") {
          if (!["bot", "human", "closed"].includes(body.status)) return send(res, 400, { error: "bad status" });
          c.status = body.status;
          store.addLine(c, "system", { bot: "عاد المساعد الآلي للمحادثة", human: "تولى موظف المحادثة", closed: "تم إغلاق المحادثة" }[body.status]);
          return send(res, 200, { ok: true });
        }
      }
      m = p.match(/^\/api\/admin\/(tickets|reservations)\/([\w-]+)$/);
      if (m && req.method === "POST") {
        const { status } = await readJson(req);
        const ok = m[1] === "tickets" ? ["open", "in_progress", "resolved"] : ["pending", "confirmed", "cancelled"];
        if (!ok.includes(status)) return send(res, 400, { error: "bad status" });
        const item = m[1] === "tickets" ? store.updateTicket(m[2], { status }) : store.updateReservation(m[2], { status });
        return item ? send(res, 200, item) : send(res, 404, { error: "not found" });
      }
    }
    return send(res, 404, { error: "not found" });
  }

  return http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      log.error(err);
      if (!res.headersSent) send(res, 400, { error: String(err.message || err) });
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const hasCreds = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.USE_CLAUDE === "1";
  const client = hasCreds ? new Anthropic() : null;
  const port = Number(process.env.PORT || 3000);
  if (!process.env.ADMIN_PASSWORD) console.warn("⚠️  ADMIN_PASSWORD not set — using the default 'admin123'. Set it before going live.");
  createApp({ client }).listen(port, () => {
    console.log(`Support desk running on http://localhost:${port}`);
    console.log(client ? `AI replies: Claude (${MODEL})` : "AI replies: OFF (set ANTHROPIC_API_KEY) — using offline FAQ answers");
    console.log(`Phone calls: point your Twilio number to ${process.env.PUBLIC_URL || "https://YOUR-DOMAIN"}/voice/incoming?b=<business-id>`);
    if (!process.env.TWILIO_AUTH_TOKEN) console.warn("⚠️  TWILIO_AUTH_TOKEN not set — Twilio webhook signatures are NOT checked.");
  });
}
