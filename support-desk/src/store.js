// Tiny JSON-file store: conversations, tickets, reservations.
// Good for a pilot; swap for Postgres/Supabase when traffic grows.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export function createStore(file) {
  let db = { conversations: {}, tickets: [], reservations: [] };
  if (file && fs.existsSync(file)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(file, "utf8")) }; } catch { /* start fresh */ }
  }
  let timer = null;
  const save = () => {
    if (!file) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = file + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
      fs.renameSync(tmp, file);
    }, 200);
  };
  const id = (p) => p + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  const now = () => new Date().toISOString();

  return {
    createConversation(businessId, { channel = "chat", caller = null, callSid = null } = {}) {
      const c = {
        id: crypto.randomUUID(), businessId, channel, caller, callSid,
        status: "bot", // bot | human | closed
        createdAt: now(), updatedAt: now(),
        transcript: [],   // what people see: {role: customer|bot|agent|system, text, at}
        apiMessages: [],  // full Claude history (append-only, includes tool blocks)
        unread: false,
      };
      db.conversations[c.id] = c; save(); return c;
    },
    getConversation: (cid) => db.conversations[cid] || null,
    findByCallSid: (sid) => Object.values(db.conversations).find((c) => c.callSid === sid) || null,
    listConversations: (businessId) =>
      Object.values(db.conversations)
        .filter((c) => !businessId || c.businessId === businessId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    addLine(c, role, text) {
      c.transcript.push({ role, text, at: now() });
      c.updatedAt = now();
      if (role === "customer") c.unread = true;
      save();
    },
    touch(c) { c.updatedAt = now(); save(); },
    addTicket(t) { const r = { id: id("T"), status: "open", createdAt: now(), ...t }; db.tickets.unshift(r); save(); return r; },
    listTickets: (businessId) => db.tickets.filter((t) => !businessId || t.businessId === businessId),
    updateTicket(tid, patch) { const t = db.tickets.find((x) => x.id === tid); if (t) { Object.assign(t, patch); save(); } return t; },
    addReservation(r) { const x = { id: id("R"), status: "pending", createdAt: now(), ...r }; db.reservations.unshift(x); save(); return x; },
    listReservations: (businessId) => db.reservations.filter((r) => !businessId || r.businessId === businessId),
    updateReservation(rid, patch) { const r = db.reservations.find((x) => x.id === rid); if (r) { Object.assign(r, patch); save(); } return r; },
  };
}
