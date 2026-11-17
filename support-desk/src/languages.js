// Languages the phone assistant speaks. One place to change speech settings.
//   stt  = Twilio <Gather> speech-recognition language code
//   tts  = Twilio <Say> voice (Amazon Polly or Google)
//   sayLang = optional language attribute for <Say> (needed for bilingual voices)
// NOTE: check these against your Twilio console (Voice → TwiML → Text-to-speech
// and the <Gather> language list). Amazon Polly has no Filipino or Urdu voice,
// so those use Google voices. A business can override any entry in
// businesses/<id>.json → voice.languages.<code>.
export const LANGUAGES = {
  ar: {
    label: "العربية (كويتي)", stt: "ar-KW", tts: "Polly.Hala-Neural", digit: "1",
    menu: "تقدر تتكلم على طول بالعربي.",
    disclose: (a, n) => `هلا والله، معك ${a}، المساعد الذكي التابع لـ${n}.`,
    ask: "شلون أقدر أساعدك؟",
    pardon: "ما سمعتك زين، ممكن تعيد؟",
    wait: ["لحظة من فضلك.", "ثواني بس.", "خلني أشيك لك."],
    bye: "ما وصلني صوتك. تقدر تتصل فينا مرة ثانية بأي وقت. مع السلامة.",
    callback: "سجلت طلبك، وراح يتصل فيك أحد الموظفين على نفس الرقم بأقرب وقت. مع السلامة.",
    noAgent: "عذراً، ما قدرنا نوصلك لموظف الحين. سجلنا طلبك وراح نتصل فيك بأقرب وقت.",
    sorry: "عذراً، صار عندي خلل بسيط. ممكن تعيد طلبك؟",
    unknown: "آسف، ما عندي معلومة أكيدة عن هالشي. تبي أحولك لموظف؟ قول موظف.",
    transfer: "أكيد، لحظة.",
    botWords: ["انت انسان", "انت بوت", "روبوت"],
    botAnswer: "لا، أنا مساعد ذكي، مو إنسان. إذا تحب أحولك لموظف، قول موظف.",
    agentWords: ["موظف", "انسان", "مشرف"],
  },
  en: {
    label: "English", stt: "en-US", tts: "Polly.Joanna-Neural", digit: "2",
    menu: "For English, press 2.",
    disclose: (a, n) => `Hi, this is ${a}, the AI assistant for ${n}.`,
    ask: "How can I help you today?",
    pardon: "Sorry, I didn't catch that. Could you say it again?",
    wait: ["One moment, please.", "Just a second.", "Let me check that for you."],
    bye: "I can't hear you. Please call us again anytime. Goodbye.",
    callback: "I've logged your request, and a team member will call you back on this number soon. Goodbye.",
    noAgent: "Sorry, we couldn't reach a team member right now. We've logged your request and will call you back soon.",
    sorry: "Sorry, something went wrong on my side. Could you repeat that?",
    unknown: "Sorry, I don't have reliable information on that. Would you like a team member? Just say agent.",
    transfer: "Sure, one moment.",
    botWords: ["are you a bot", "are you human", "real person", "are you a robot", "a machine"],
    botAnswer: "No, I'm an AI assistant, not a person. If you'd like a team member, just say agent.",
    agentWords: ["agent", "human", "person", "staff", "representative"],
  },
  hi: {
    label: "हिंदी", stt: "hi-IN", tts: "Polly.Kajal-Neural", sayLang: "hi-IN", digit: "3",
    menu: "हिंदी के लिए 3 दबाएं।",
    disclose: (a, n) => `नमस्ते, मैं ${a} हूँ, ${n} की AI असिस्टेंट।`,
    ask: "मैं आपकी कैसे मदद कर सकती हूँ?",
    pardon: "माफ़ कीजिए, मैं ठीक से सुन नहीं पाई। क्या आप दोबारा बोल सकते हैं?",
    wait: ["एक पल रुकिए।", "बस एक सेकंड।", "मैं अभी देखती हूँ।"],
    bye: "आपकी आवाज़ नहीं आ रही है। आप कभी भी दोबारा कॉल कर सकते हैं। धन्यवाद।",
    callback: "आपका अनुरोध दर्ज हो गया है। हमारी टीम का कोई सदस्य जल्द ही इसी नंबर पर आपको कॉल करेगा। धन्यवाद।",
    noAgent: "माफ़ कीजिए, अभी कोई स्टाफ़ उपलब्ध नहीं है। आपका अनुरोध दर्ज कर लिया गया है, हम जल्द कॉल करेंगे।",
    sorry: "माफ़ कीजिए, कुछ गड़बड़ हो गई। क्या आप दोबारा बता सकते हैं?",
    unknown: "माफ़ कीजिए, इस बारे में मेरे पास पक्की जानकारी नहीं है। क्या आप स्टाफ़ से बात करना चाहेंगे? बस एजेंट बोलिए।",
    transfer: "ज़रूर, एक पल।",
    botWords: ["क्या आप इंसान", "रोबोट", "बॉट", "मशीन"],
    botAnswer: "नहीं, मैं एक AI असिस्टेंट हूँ, इंसान नहीं। अगर आप स्टाफ़ से बात करना चाहें तो बस एजेंट बोलिए।",
    agentWords: ["एजेंट", "स्टाफ", "इंसान", "agent"],
  },
  fil: {
    label: "Filipino", stt: "fil-PH", tts: "Google.fil-PH-Standard-A", digit: "4",
    menu: "Para sa Filipino, pindutin ang 4.",
    disclose: (a, n) => `Hello po, ako si ${a}, ang AI assistant ng ${n}.`,
    ask: "Paano ko po kayo matutulungan?",
    pardon: "Pasensya na po, hindi ko narinig nang maayos. Pakiulit po?",
    wait: ["Sandali lang po.", "Saglit lang po.", "Titingnan ko po."],
    bye: "Hindi ko po kayo marinig. Tumawag lang po ulit anumang oras. Paalam po.",
    callback: "Naitala ko na po ang inyong request, at tatawagan kayo ng aming staff sa numerong ito. Salamat po.",
    noAgent: "Pasensya na po, walang available na staff ngayon. Naitala na po ang request ninyo at tatawagan namin kayo.",
    sorry: "Pasensya na po, may nangyaring mali. Pakiulit po?",
    unknown: "Pasensya na po, wala akong siguradong impormasyon tungkol diyan. Gusto ninyo bang makausap ang staff? Sabihin lang po ang agent.",
    transfer: "Sige po, sandali lang.",
    botWords: ["tao ka ba", "robot ka ba", "bot ka ba", "totoong tao", "makina"],
    botAnswer: "Hindi po, AI assistant po ako, hindi tao. Kung gusto ninyong makausap ang staff, sabihin lang po ang agent.",
    agentWords: ["agent", "ahente", "staff", "tao"],
  },
  ur: {
    label: "اردو", stt: "ur-PK", tts: "Google.ur-IN-Standard-A", digit: "5",
    menu: "اردو کے لیے 5 دبائیں۔",
    disclose: (a, n) => `السلام علیکم، میں ${a} ہوں، ${n} کی AI اسسٹنٹ۔`,
    ask: "میں آپ کی کیا مدد کر سکتی ہوں؟",
    pardon: "معاف کیجیے، میں ٹھیک سے سن نہیں سکی۔ کیا آپ دوبارہ بول سکتے ہیں؟",
    wait: ["ایک لمحہ رکیے۔", "بس ایک سیکنڈ۔", "میں ابھی دیکھتی ہوں۔"],
    bye: "آپ کی آواز نہیں آ رہی۔ آپ کسی بھی وقت دوبارہ کال کر سکتے ہیں۔ شکریہ۔",
    callback: "آپ کی درخواست درج ہو گئی ہے۔ ہماری ٹیم کا کوئی رکن جلد اسی نمبر پر آپ کو کال کرے گا۔ شکریہ۔",
    noAgent: "معاف کیجیے، ابھی کوئی اسٹاف دستیاب نہیں۔ آپ کی درخواست درج کر لی گئی ہے، ہم جلد کال کریں گے۔",
    sorry: "معاف کیجیے، کچھ گڑبڑ ہو گئی۔ کیا آپ دوبارہ بتا سکتے ہیں؟",
    unknown: "معاف کیجیے، اس بارے میں میرے پاس پکی معلومات نہیں ہیں۔ کیا آپ اسٹاف سے بات کرنا چاہیں گے؟ بس ایجنٹ بولیں۔",
    transfer: "ضرور، ایک لمحہ۔",
    botWords: ["کیا آپ انسان", "روبوٹ", "بوٹ", "مشین"],
    botAnswer: "نہیں، میں ایک AI اسسٹنٹ ہوں، انسان نہیں۔ اگر آپ اسٹاف سے بات کرنا چاہیں تو بس ایجنٹ بولیں۔",
    agentWords: ["ایجنٹ", "اسٹاف", "انسان", "agent"],
  },
};
export const LANG_CODES = Object.keys(LANGUAGES);

// Language settings for one business (its overrides on top of the defaults).
export function langFor(b, code) {
  const base = LANGUAGES[code] || LANGUAGES.ar;
  return { code: LANGUAGES[code] ? code : "ar", ...base, ...(b.voice?.languages?.[code] || {}) };
}

// How the business and assistant are named when speaking a given language.
export function namesFor(b, code) {
  if (code === "ar" || code === "ur") return { business: b.name, assistant: b.assistantName };
  return { business: b.nameEn || b.name, assistant: b.assistantNameEn || b.assistantName };
}

// Opening line in a language: AI disclosure (always, built here) + question.
export function disclosure(b, code) {
  const L = langFor(b, code), n = namesFor(b, code);
  return L.disclose(n.assistant, n.business);
}
