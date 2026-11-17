// Offline answers used when the Claude API is not configured or fails.
import { normalizeDigits } from "./safety.js";
import { isFemale } from "./businesses.js";

const norm = (s) => normalizeDigits(s).toLowerCase()
  .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}\s]/gu, " ");

const HUMAN = ["موظف", "انسان", "شخص حقيقي", "agent", "human", "مشرف", "مدير"];
const HOURS = ["دوام", "اوقات", "ساعات", "متي تفتح", "متي تسك", "يفتح", "hours", "open"];
const MENU = ["منيو", "قائمه", "اسعار", "سعر", "كم", "menu", "price", "الخدمات"];
const CONTACT = ["رقم", "تلفون", "هاتف", "عنوان", "موقع", "وين", "contact", "phone", "location"];

const ARE_YOU_BOT = ["انت انسان", "انتي انسان", "انت بوت", "انتي بوت", "روبوت", "بوت", "انت اله", "اكلم اله", "ذكاء اصطناعي", "are you human", "are you a bot", "real person"];

export function faqReply(b, message) {
  const m = norm(message);
  const has = (words) => words.some((w) => m.includes(norm(w)));
  // Honest answer first: never let "إنسان" in this question trigger a silent hand-off.
  if (has(ARE_YOU_BOT)) {
    return { text: `للا، أنا ${isFemale(b) ? "مساعدة ذكية تابعة" : "مساعد ذكي تابع"} لـ${b.name}، مو إنسان. إذا تحب أحولك لموظف من الفريق، قول "موظف".` };
  }
  if (has(HUMAN)) return { text: "أكيد، حوّلت محادثتك لأحد الموظفين وراح يرد عليك هنا بأقرب وقت.", handoff: true };
  for (const f of b.faq || []) {
    if ((f.keywords || []).some((k) => m.includes(norm(k))) || m.includes(norm(f.q))) return { text: f.a };
  }
  if (has(HOURS)) return { text: `أوقات العمل: ${b.hours}` };
  if (has(MENU)) {
    const items = (b.catalog || []).slice(0, 8).map((i) => `• ${i.name}: ${i.price} ${b.currency}`).join("\n");
    return { text: `هذي بعض الأسعار:\n${items}` };
  }
  if (has(CONTACT)) {
    return { text: Object.values(b.contact || {}).join("\n") };
  }
  return { text: `شكراً لتواصلك مع ${b.name}. ما قدرت أفهم طلبك بالضبط؛ تقدر تسألني عن الأوقات، الأسعار، أو التواصل، أو تكتب "موظف" للتحدث مع أحد الفريق.` };
}
