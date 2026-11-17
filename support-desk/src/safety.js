// Mask sensitive numbers before they are stored or sent to the model.
// Card numbers (13-19 digits, spaces/dashes allowed) and short codes that
// follow words like OTP / الرمز / رقم سري / PIN / CVV.
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const normalizeDigits = (s) => s.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));

function luhn(num) {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = +num[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

export function redact(text) {
  let found = [];
  let out = normalizeDigits(text);
  out = out.replace(/\b(?:\d[ -]?){13,19}\b/g, (m) => {
    const digits = m.replace(/\D/g, "");
    if (digits.length >= 13 && luhn(digits)) { found.push("card"); return "[رقم بطاقة مخفي ****" + digits.slice(-4) + "]"; }
    return m;
  });
  out = out.replace(/((?:otp|pin|cvv|cvc|password|الرمز|رمز التحقق|الرقم السري|رقم سري|الباسورد|كلمة السر|كلمة المرور)\s*[:：=]?\s*(?:هو|is)?\s*)(\d{3,8})/gi,
    (_, pre) => { found.push("secret"); return pre + "[مخفي]"; });
  return { text: out, found: [...new Set(found)] };
}
