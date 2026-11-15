// Builds the print-ready PDF for Box 1 ("Little Explorer").
// Usage (from the repo root):  node print/box1/build.mjs
// Output: print/box1/fizzplay-box1-print.pdf  (A4 pages, four A6 cards per page with cut lines)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const fonts = pathToFileURL(join(here, '../../app/assets/fonts')).href;
const qr = readFileSync(join(here, 'qr-play.svg'), 'utf8');
const SITE = 'mohammed-omar.mohammedoomar85.workers.dev';
const WHATSAPP = '+965 5580 3175';
const EMAIL = 'Fizwalaab@gmail.com';

const C = { ink: '#1B2A4A', muted: '#55607A', line: '#E9DFC9', bg: '#FFFBF2', sea: '#0A7F96', sun: '#FFC23D', coral: '#F2604F', leaf: '#2E9E62', plum: '#7B5CC9', band: '#FFF1D6' };
const TILE = [C.coral, C.sea, C.sun, C.leaf, C.plum];
const AR = '٠١٢٣٤٥٦٧٨٩';
const ar = (n) => String(n).replace(/\d/g, (d) => AR[d]);

// ---------- building plans (same shapes as the "Build It" game) ----------
// s = square, u = triangle up, d = triangle down, . = empty
const PLANS = {
  small: [
    { ar: 'بيت', en: 'House', rows: ['uu', 'ss', 'ss'] },
    { ar: 'شجرة', en: 'Tree', rows: ['.u.', 'uuu', '.s.', '.s.'] },
    { ar: 'صاروخ', en: 'Rocket', rows: ['.u.', '.s.', '.s.', 'usu'] },
    { ar: 'قارب', en: 'Boat', rows: ['.u..', '.su.', 'ssss'] },
  ],
  big: [
    { ar: 'قلعة', en: 'Castle', level: 1, rows: ['u.u.u', 'sssss', 'ss.ss'] },
    { ar: 'صاروخ ونار', en: 'Rocket with flame', level: 2, rows: ['.u.', '.s.', '.s.', 'usu', '.d.'] },
    { ar: 'سفينة', en: 'Ship', level: 2, rows: ['.u..', '.su.', 'dssd'] },
    { ar: 'مكعّب ثلاثي الأبعاد', en: '3D cube', level: 3, rows: ['.s..', 'ssss', '.s..'], fold: true },
  ],
};
function planSvg(rows, size = 34) {
  const cols = Math.max(...rows.map((r) => r.length));
  let k = 0, out = '';
  rows.forEach((line, r) => [...line].forEach((ch, c) => {
    if (ch === '.') return;
    const x = c * size, y = r * size, f = TILE[k++ % TILE.length], w = size;
    if (ch === 's') out += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${w - 4}" rx="3" fill="${f}" fill-opacity=".85" stroke="#fff" stroke-width="2"/>`;
    if (ch === 'u') out += `<polygon points="${x + 2},${y + w - 2} ${x + w / 2},${y + 3} ${x + w - 2},${y + w - 2}" fill="${f}" fill-opacity=".85" stroke="#fff" stroke-width="2"/>`;
    if (ch === 'd') out += `<polygon points="${x + 2},${y + 2} ${x + w - 2},${y + 2} ${x + w / 2},${y + w - 3}" fill="${f}" fill-opacity=".85" stroke="#fff" stroke-width="2"/>`;
  }));
  return `<svg width="${cols * size}" height="${rows.length * size}" viewBox="0 0 ${cols * size} ${rows.length * size}">${out}</svg>`;
}
const count = (rows, ch) => rows.join('').split('').filter((x) => x === ch).length;
// Arabic counts: مربع واحد، مربعين، ٣ مربعات، ١١ مربع
function arCount(n, one, two, few) {
  if (n === 1) return `${one} واحد`;
  if (n === 2) return two;
  if (n <= 10) return `${ar(n)} ${few}`;
  return `${ar(n)} ${one}`;
}

// ---------- weekly challenges ----------
const WEEKS = {
  small: [
    { c: C.sun, ar: { skill: 'الأشكال', t: 'صيّاد الأشكال', hand: 'ركّب بازل الأشكال، وسمِّ كل شكل: دائرة، مثلث، مربع.', app: 'لعبة «طابق الظل»', dare: 'دوّر على ٣ دوائر في البيت!' },
      en: { skill: 'Shapes', t: 'Shape hunter', hand: 'Fit the shape puzzle and name each shape: circle, triangle, square.', app: 'Shadow Match', dare: 'Find 3 circles at home!' } },
    { c: C.sea, ar: { skill: 'البناء', t: 'البنّاء الصغير', hand: 'حط المكعبات المغناطيسية على كروت المخططات: بيت، شجرة، صاروخ، قارب.', app: 'لعبة «ركّب الشكل»', dare: 'ابنِ بيت لدميتك!' },
      en: { skill: 'Building', t: 'Little builder', hand: 'Build the plan cards with the magnetic tiles: house, tree, rocket, boat.', app: 'Build It', dare: 'Build a house for your toy!' } },
    { c: C.coral, ar: { skill: 'الحروف', t: 'أول الحروف', hand: 'رتّب كروت الحروف، وتتبّع كل حرف بإصبعك.', app: 'لعبة «تتبّع الحرف»', dare: 'قول ٣ كلمات تبدأ بحرف الباء!' },
      en: { skill: 'Letters', t: 'First letters', hand: 'Sort the letter cards and trace each letter with your finger.', app: 'Letter Trace', dare: 'Say 3 words that start with C!' } },
    { c: C.leaf, ar: { skill: 'الأرقام', t: 'كم قطعة؟', hand: 'عد المكعبات، وابنِ عمود من ٥ قطع، وبعدها من ١٠.', app: 'لعبة «عد وطابق»', dare: 'صوّر بناءك وخذ الختم!' },
      en: { skill: 'Numbers', t: 'How many pieces?', hand: 'Count the tiles and build a stack of 5, then 10.', app: 'Count & Match', dare: 'Take a photo of your build and earn the stamp!' } },
  ],
  big: [
    { c: C.sea, ar: { skill: 'الهندسة', t: 'المهندس الصغير', hand: 'ابنِ القلعة والصاروخ والسفينة من كروت المخططات، من السهل للصعب.', app: 'لعبة «ركّب الشكل»', dare: 'اطوِ المكعّب الثلاثي الأبعاد!' },
      en: { skill: 'Engineering', t: 'Young engineer', hand: 'Build the castle, rocket and ship from the plan cards, easy to hard.', app: 'Build It', dare: 'Fold the 3D cube!' } },
    { c: C.plum, ar: { skill: 'الاستكشاف', t: 'صيّاد الكنز', hand: 'احفر بالأدوات وطلّع الكنز مثل المستكشفين.', app: 'لعبة «غوص الكنز»', dare: 'احكِ لأهلك شنو لقيت!' },
      en: { skill: 'Exploring', t: 'Treasure hunter', hand: 'Dig out the treasure with the tools, like a real explorer.', app: 'Treasure Dive', dare: 'Tell your family what you found!' } },
    { c: C.coral, ar: { skill: 'الكلمات', t: 'كلمات البحر', hand: 'اقرأ كروت الكلمات، وركّب كل كلمة بالحروف.', app: 'لعبة «اقرأ واختار»', dare: 'اكتب كلمة بدون ما تشوف الكرت!' },
      en: { skill: 'Words', t: 'Sea words', hand: 'Read the word cards and build each word letter by letter.', app: 'Read & Match', dare: 'Spell a word without looking!' } },
    { c: C.leaf, ar: { skill: 'الحساب', t: 'حساب القطع', hand: '٣ مربعات + ٢ مثلث = كم قطعة؟ اجمع وتأكد بالعد.', app: 'لعبة «الميزان»', dare: 'صوّر بناءك وخذ الختم!' },
      en: { skill: 'Maths', t: 'Tile maths', hand: '3 squares + 2 triangles = how many pieces? Add, then count to check.', app: 'Balance', dare: 'Take a photo of your build and earn the stamp!' } },
  ],
};

// ---------- letters and words ----------
const LETTERS = {
  ar: [{ ch: 'ب', w: 'بطة', p: '🦆' }, { ch: 'ت', w: 'تفاحة', p: '🍎' }, { ch: 'ن', w: 'نجمة', p: '⭐' }, { ch: 'و', w: 'وردة', p: '🌹' }],
  en: [{ ch: 'L', w: 'Lion', p: '🦁' }, { ch: 'C', w: 'Cat', p: '🐱' }, { ch: 'O', w: 'Orange', p: '🍊' }, { ch: 'U', w: 'Umbrella', p: '☂️' }],
};
const WORDS = {
  ar: [{ w: 'سمكة', l: ['س', 'م', 'ك', 'ة'], p: '🐟' }, { w: 'نجمة', l: ['ن', 'ج', 'م', 'ة'], p: '⭐' }, { w: 'قارب', l: ['ق', 'ا', 'ر', 'ب'], p: '⛵' }, { w: 'وردة', l: ['و', 'ر', 'د', 'ة'], p: '🌹' }],
  en: [{ w: 'FISH', l: [...'FISH'], p: '🐟' }, { w: 'STAR', l: [...'STAR'], p: '⭐' }, { w: 'BOAT', l: [...'BOAT'], p: '⛵' }, { w: 'MOON', l: [...'MOON'], p: '🌙' }],
};

// ---------- pieces ----------
const logo = (size = 16) => `<span class="logo"><span class="mark" style="--s:${size / 2}px"><i></i><i></i><i></i><i></i></span><b>فز و العب</b> <span class="en-name">Fizz &amp; Play</span></span>`;
const sheet = (cards, label) => `<section class="sheet"><div class="grid">${cards.map((c) => `<div class="card">${c}</div>`).join('')}</div><div class="label">${label}</div></section>`;

function weekCard(w, i, lang, box) {
  const d = w[lang], rtl = lang === 'ar';
  const L = rtl ? { week: `الأسبوع ${ar(i + 1)}`, hand: 'بيدك:', app: 'بالتطبيق:', dare: 'التحدّي', box: box === 'small' ? 'صندوق الصغار · ٣-٥' : 'صندوق الكبار · ٦-٨' }
                : { week: `Week ${i + 1}`, hand: 'Hands-on:', app: 'In the app:', dare: 'Challenge', box: box === 'small' ? 'Little box · 3-5' : 'Big box · 6-8' };
  return `<div class="wk" dir="${rtl ? 'rtl' : 'ltr'}" style="--c:${w.c}">
    <div class="wk-top"><span class="wk-n">${L.week}</span><span class="tag">${d.skill}</span></div>
    <h2>${d.t}</h2>
    <p><b>${L.hand}</b> ${d.hand}</p>
    <p><b>${L.app}</b> ${d.app}</p>
    <div class="dare"><span>${L.dare}</span>${d.dare}</div>
    <div class="foot">${logo(12)}<span>${L.box}</span></div>
  </div>`;
}

function planCard(p, box) {
  const s = count(p.rows, 's'), t = count(p.rows, 'u') + count(p.rows, 'd');
  const lvl = p.level ? `<span class="tag">${'★'.repeat(p.level)}</span>` : '';
  return `<div class="plan">
    <div class="plan-head"><h2 dir="rtl">${p.ar} · <bdi class="en" dir="ltr">${p.en}</bdi></h2>${lvl}</div>
    <div class="plan-art">${planSvg(p.rows, p.rows[0].length > 4 ? 30 : 36)}</div>
    <p class="need" dir="rtl">تحتاج: ${arCount(s, 'مربع', 'مربعين', 'مربعات')}${t ? ` و${arCount(t, 'مثلث', 'مثلثين', 'مثلثات')}` : ''}</p>
    <p class="need en">You need: ${s} square${s === 1 ? '' : 's'}${t ? ` and ${t} triangle${t === 1 ? '' : 's'}` : ''}</p>
    ${p.fold ? '<p class="hint" dir="rtl">ركّب الشكل على الطاولة، وبعدين ارفع الأطراف لين يصير مكعّب.</p><p class="hint" dir="ltr">Lay it flat, then fold up the sides into a cube.</p>' : ''}
    <div class="foot">${logo(12)}<span>${box === 'small' ? 'صندوق الصغار · Little box' : 'صندوق الكبار · Big box'}</span></div>
  </div>`;
}

function letterCard(l, lang) {
  return `<div class="letter" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
    <div class="big-letter">${l.ch}</div>
    <div class="trace">${[1, 2, 3].map(() => `<span>${l.ch}</span>`).join('')}</div>
    <div class="pic">${l.p}</div>
    <div class="word">${l.w}</div>
    <div class="foot">${logo(12)}<span>${lang === 'ar' ? 'تتبّع الحرف بإصبعك' : 'Trace with your finger'}</span></div>
  </div>`;
}

function wordCard(w, lang) {
  return `<div class="wordc" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
    <div class="pic">${w.p}</div>
    <div class="word big">${w.w}</div>
    <div class="tiles">${w.l.map((x) => `<span>${x}</span>`).join('')}</div>
    <p class="hint">${lang === 'ar' ? 'قص الحروف وركّب الكلمة' : 'Cut out the letters and build the word'}</p>
    <div class="foot">${logo(12)}<span>${lang === 'ar' ? 'كلمات البحر' : 'Sea words'}</span></div>
  </div>`;
}

function passportCard() {
  const spots = [['الأسبوع ١', 'Week 1'], ['الأسبوع ٢', 'Week 2'], ['الأسبوع ٣', 'Week 3'], ['الأسبوع ٤', 'Week 4'], ['الصندوق ١', 'Box 1']];
  return `<div class="pass">
    <div class="pass-head">${logo(14)}</div>
    <h2>جواز المستكشف <span class="en">Explorer passport</span></h2>
    <div class="name-line"><span>الاسم · Name</span></div>
    <div class="stamps">${spots.map(([a, e], i) => `<div class="stamp${i === 4 ? ' gold' : ''}"><span>${a}</span><small>${e}</small></div>`).join('')}</div>
    <p class="hint">حط ملصق أو ختم لما تخلص تحدّي الأسبوع · Add a sticker for each week</p>
  </div>`;
}

function codeCard() {
  return `<div class="code">
    <div class="pass-head">${logo(14)}</div>
    <h2>كود صندوقك <span class="en">Your box code</span></h2>
    <div class="code-box">FZ1-</div>
    <div class="code-steps">
      <ol dir="rtl"><li>امسح الكود أو افتح الرابط</li><li>اضغط «أدخل كود الصندوق»</li><li>اكتب الكود وخذ أول ختم!</li></ol>
      <div class="qr">${qr}</div>
    </div>
    <p class="url" dir="ltr">${SITE}/play</p>
  </div>`;
}

function welcome(lang) {
  const A = lang === 'ar';
  const body = A ? `
    <h1>أهلاً بكم في الصندوق الأول: <em>المستكشف الصغير</em></h1>
    <p>شكراً لأنكم من أول عائلات فز و العب! هذا الصندوق فيه شهر كامل من اللعب والتعلّم. كل أسبوع مهارة جديدة: نشاط باليد من الصندوق، ولعبة في التطبيق تكمّله.</p>
    <div class="cols"><div><h3>شلون تبدأون</h3><ol>
      <li>امسحوا الـ QR، أو افتحوا الرابط تحت.</li>
      <li>اكتبوا كود الصندوق من الكرت.</li>
      <li>كل أسبوع، افتحوا كرت التحدّي والعبوا مع بعض.</li>
      <li>صوّروا البناء وخذوا الختم في الجواز.</li></ol></div>
      <div class="qr-wrap"><div class="qr">${qr}</div><p dir="ltr">${SITE}/play</p></div></div>
    <p class="contact">أي سؤال؟ واتساب <span dir="ltr">${WHATSAPP}</span> · ${EMAIL}</p>` : `
    <h1>Welcome to Box 1: <em>Little Explorer</em></h1>
    <p>Thank you for being one of the first Fizz &amp; Play families! This box holds a full month of play and learning. One new skill a week: a hands-on activity from the box, and a game in the app that goes with it.</p>
    <div class="cols"><div><h3>How to start</h3><ol>
      <li>Scan the QR code, or open the link below.</li>
      <li>Enter the code from your box code card.</li>
      <li>Each week, open a challenge card and play together.</li>
      <li>Photograph your build and add a stamp to the passport.</li></ol></div>
      <div class="qr-wrap"><div class="qr">${qr}</div><p>${SITE}/play</p></div></div>
    <p class="contact">Questions? WhatsApp ${WHATSAPP} · ${EMAIL}</p>`;
  const half = `<div class="letter-a5" dir="${A ? 'rtl' : 'ltr'}"><div class="pass-head">${logo(16)}</div>${body}</div>`;
  return `<section class="sheet"><div class="halves">${half}${half}</div><div class="label">${A ? 'رسالة الترحيب (عربي) · نسختين في الصفحة' : 'Welcome letter (English) · two per page'}</div></section>`;
}

function guide() {
  const rows = [
    ['رسالة الترحيب', '٢ (عربي) أو ٣ (إنجليزي)', 'كل صندوق', '١ ورقة لكل صندوقين'],
    ['كروت التحدّي', '٤ أو ٥ (الصغار) · ٦ أو ٧ (الكبار)', 'حسب العمر واللغة', '١ ورقة لكل صندوق'],
    ['مخططات البناء', '٨ (الصغار) · ٩ (الكبار)', 'حسب العمر', '١ ورقة لكل صندوق'],
    ['كروت الحروف', '١٠ (عربي) · ١١ (إنجليزي)', 'صندوق الصغار', '١ ورقة لكل صندوق'],
    ['كروت الكلمات', '١٢ (عربي) · ١٣ (إنجليزي)', 'صندوق الكبار', '١ ورقة لكل صندوق'],
    ['جواز الأختام', '١٤', 'كل صندوق', '١ ورقة لكل ٤ صناديق'],
    ['كرت الكود', '١٥', 'كل صندوق', '١ ورقة لكل ٤ صناديق، واكتب الكود أو الصقه'],
  ];
  return `<section class="sheet guide" dir="rtl">
    <div class="pass-head">${logo(18)}</div>
    <h1>دليل طباعة الصندوق الأول</h1>
    <p>اطبع على ورق A4 <b>سميك (٢٥٠ إلى ٣٠٠ جرام)</b>، بالألوان، و<b>بدون تصغير</b> (Actual size / 100%). كل صفحة فيها ٤ كروت A6. قص على الخطوط المتقطعة. ويفضّل تغليف الكروت (لامينيشن) عشان تتحمل.</p>
    <table><thead><tr><th>المحتوى</th><th>رقم الصفحة</th><th>لأي صندوق</th><th>الكمية</th></tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <h3>كرت الكود</h3>
    <p>سوّ أكواد للدفعة من لوحة Supabase (SQL Editor) بهالأمر، مثلاً لـ ٥٠ صندوق:</p>
    <pre dir="ltr">select * from public.make_box_codes(1, 50);</pre>
    <p>اكتب كل كود بخط واضح في المربع، أو اطبعه على ملصق صغير. <b>كل كود لصندوق واحد بس.</b></p>
    <h3>لكل صندوق لغة</h3>
    <p>اختار نسخة العربي أو الإنجليزي حسب اللغة اللي اختارها العميل في الحجز. ومخططات البناء والجواز والكود فيها اللغتين.</p>
  </section>`;
}

// ---------- page ----------
const pages = [
  guide(),
  welcome('ar'),
  welcome('en'),
  sheet(WEEKS.small.map((w, i) => weekCard(w, i, 'ar', 'small')), 'كروت التحدّي · صندوق الصغار · عربي'),
  sheet(WEEKS.small.map((w, i) => weekCard(w, i, 'en', 'small')), 'Challenge cards · Little box · English'),
  sheet(WEEKS.big.map((w, i) => weekCard(w, i, 'ar', 'big')), 'كروت التحدّي · صندوق الكبار · عربي'),
  sheet(WEEKS.big.map((w, i) => weekCard(w, i, 'en', 'big')), 'Challenge cards · Big box · English'),
  sheet(PLANS.small.map((p) => planCard(p, 'small')), 'مخططات البناء · صندوق الصغار · Building plans · Little box'),
  sheet(PLANS.big.map((p) => planCard(p, 'big')), 'مخططات البناء · صندوق الكبار · Building plans · Big box'),
  sheet(LETTERS.ar.map((l) => letterCard(l, 'ar')), 'كروت الحروف · عربي · صندوق الصغار'),
  sheet(LETTERS.en.map((l) => letterCard(l, 'en')), 'Letter cards · English · Little box'),
  sheet(WORDS.ar.map((w) => wordCard(w, 'ar')), 'كروت الكلمات · عربي · صندوق الكبار'),
  sheet(WORDS.en.map((w) => wordCard(w, 'en')), 'Word cards · English · Big box'),
  sheet([passportCard(), passportCard(), passportCard(), passportCard()], 'جواز الأختام · Stamp passport'),
  sheet([codeCard(), codeCard(), codeCard(), codeCard()], 'كرت الكود · Box code card'),
];

const css = `
@font-face { font-family: 'Baloo'; src: url('${fonts}/BalooBhaijaan2_800ExtraBold.ttf'); font-weight: 800; }
@font-face { font-family: 'Baloo'; src: url('${fonts}/BalooBhaijaan2_700Bold.ttf'); font-weight: 700; }
@font-face { font-family: 'Tajawal'; src: url('${fonts}/Tajawal_500Medium.ttf'); font-weight: 500; }
@font-face { font-family: 'Tajawal'; src: url('${fonts}/Tajawal_700Bold.ttf'); font-weight: 700; }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; }
body { font-family: 'Tajawal', 'Noto Color Emoji', sans-serif; color: ${C.ink}; font-size: 11pt; line-height: 1.5; }
h1, h2, h3 { font-family: 'Baloo', 'Tajawal', sans-serif; margin: 0; line-height: 1.25; }
.sheet { width: 210mm; height: 297mm; position: relative; page-break-after: always; overflow: hidden; }
.grid { display: grid; grid-template-columns: 105mm 105mm; grid-template-rows: 143mm 143mm; }
.card { border: 0.4mm dashed #B9B2A2; padding: 7mm; position: relative; overflow: hidden; }
.label { position: absolute; bottom: 3mm; left: 0; right: 0; text-align: center; font-size: 8pt; color: ${C.muted}; }
.logo { display: inline-flex; align-items: center; gap: 4px; font-family: 'Baloo'; font-size: 10pt; }
.logo .en-name { color: ${C.muted}; font-weight: 700; font-size: 8pt; }
.mark { display: inline-grid; grid-template-columns: repeat(2, var(--s)); gap: 1.5px; }
.mark i { width: var(--s); height: var(--s); border-radius: 2px; display: block; }
.mark i:nth-child(1) { background: ${C.coral}; } .mark i:nth-child(2) { background: ${C.sun}; border-radius: 50%; } .mark i:nth-child(3) { background: ${C.sea}; } .mark i:nth-child(4) { background: ${C.leaf}; }
.foot { position: absolute; bottom: 6mm; left: 7mm; right: 7mm; display: flex; justify-content: space-between; align-items: center; font-size: 8pt; color: ${C.muted}; border-top: 0.3mm solid ${C.line}; padding-top: 2mm; }
.tag { display: inline-block; font-weight: 700; font-size: 9pt; padding: 0.5mm 3mm; border-radius: 99px; background: var(--c, ${C.sun}); color: #fff; }
.en { color: ${C.muted}; font-weight: 700; font-size: .8em; }
/* week card */
.wk { height: 100%; border-top: 3mm solid var(--c); margin: -7mm -7mm 0; padding: 6mm 7mm 0; }
.wk-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3mm; }
.wk-n { font-family: 'Baloo'; font-size: 13pt; color: ${C.muted}; }
.wk h2 { font-size: 20pt; margin-bottom: 3mm; }
.wk p { margin: 0 0 2.5mm; font-size: 11pt; }
.dare { margin-top: 4mm; background: ${C.band}; border-radius: 4mm; padding: 3mm 4mm; font-weight: 700; font-size: 11.5pt; }
.dare span { display: block; font-family: 'Baloo'; color: var(--c); font-size: 10pt; }
/* plan card */
.plan h2 { font-size: 17pt; }
.plan-head { display: flex; justify-content: space-between; align-items: center; }
.plan-head .tag { background: ${C.sun}; color: ${C.ink}; }
.plan-art { height: 72mm; display: grid; place-items: center; background: #FBF8F1; border-radius: 4mm; margin: 3mm 0; border: 0.3mm solid ${C.line}; }
.need { margin: 0; font-weight: 700; text-align: center; }
.need.en { font-size: 9pt; }
.hint { margin: 2mm 0 0; font-size: 9pt; color: ${C.muted}; text-align: center; }
/* letter card */
.letter, .wordc { text-align: center; height: 100%; }
.big-letter { font-family: 'Baloo'; font-size: 120pt; line-height: 1.05; color: ${C.coral}; margin-top: 2mm; }
.trace { display: flex; justify-content: center; gap: 6mm; font-family: 'Baloo'; font-size: 40pt; line-height: 1.1; color: transparent; -webkit-text-stroke: 0.5mm #9AA3B5; }
.pic { font-size: 40pt; line-height: 1.2; }
.word { font-family: 'Baloo'; font-size: 22pt; }
.word.big { font-size: 34pt; letter-spacing: 1mm; }
.tiles { display: flex; justify-content: center; gap: 3mm; margin-top: 4mm; }
.tiles span { width: 18mm; height: 20mm; border: 0.5mm dashed ${C.plum}; border-radius: 3mm; display: grid; place-items: center; font-family: 'Baloo'; font-size: 24pt; color: ${C.plum}; }
.wordc .pic { font-size: 54pt; margin-top: 4mm; }
/* passport + code */
.pass, .code { text-align: center; }
.pass-head { display: flex; justify-content: center; margin-bottom: 3mm; }
.pass h2, .code h2 { font-size: 18pt; margin-bottom: 4mm; }
.name-line { border-bottom: 0.4mm solid ${C.ink}; height: 10mm; margin: 0 6mm 5mm; display: flex; align-items: flex-end; justify-content: center; }
.name-line span { font-size: 8pt; color: ${C.muted}; }
.stamps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; justify-items: center; }
.stamp { width: 25mm; height: 25mm; border-radius: 50%; border: 0.6mm dashed ${C.sea}; display: grid; place-content: center; font-weight: 700; font-size: 9pt; }
.stamp small { font-size: 7pt; color: ${C.muted}; font-weight: 500; }
.stamp.gold { border-color: ${C.sun}; border-width: 0.9mm; }
.code-box { margin: 2mm auto 4mm; width: 70mm; height: 18mm; border: 0.7mm dashed ${C.coral}; border-radius: 4mm; display: flex; align-items: center; padding-inline: 4mm; font-family: 'Baloo'; font-size: 20pt; direction: ltr; }
.code-steps { display: flex; gap: 4mm; align-items: center; justify-content: center; }
.code-steps ol { text-align: right; margin: 0; padding-inline-start: 5mm; font-size: 10pt; }
.qr svg { width: 30mm; height: 30mm; display: block; }
.url { font-size: 8pt; color: ${C.muted}; margin-top: 3mm; }
/* welcome (A5 halves) */
.halves { display: grid; grid-template-rows: 148.5mm 148.5mm; }
.letter-a5 { border-bottom: 0.4mm dashed #B9B2A2; padding: 10mm 14mm; }
.letter-a5 h1 { font-size: 20pt; margin-bottom: 3mm; }
.letter-a5 h1 em { font-style: normal; color: ${C.sea}; }
.letter-a5 p { margin: 0 0 3mm; }
.cols { display: flex; gap: 8mm; align-items: center; }
.cols ol { margin: 2mm 0 0; padding-inline-start: 6mm; }
.cols h3 { font-size: 13pt; }
.qr-wrap { text-align: center; font-size: 8pt; color: ${C.muted}; }
.contact { font-size: 9.5pt; color: ${C.muted}; border-top: 0.3mm solid ${C.line}; padding-top: 2mm; }
/* guide */
.guide { padding: 16mm 18mm; }
.guide h1 { font-size: 24pt; margin: 4mm 0; }
.guide table { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 10pt; }
.guide th, .guide td { border: 0.3mm solid ${C.line}; padding: 2mm 3mm; text-align: right; }
.guide th { background: ${C.band}; }
.guide h3 { margin-top: 6mm; font-size: 14pt; }
.guide pre { background: #F4F1EA; padding: 3mm; border-radius: 2mm; font-size: 10pt; }
`;

const html = `<!doctype html><html lang="ar"><head><meta charset="utf-8"><title>Fizz & Play · Box 1 print</title><style>${css}</style></head><body>${pages.join('\n')}</body></html>`;
const htmlPath = join(here, 'box1-print.html');
writeFileSync(htmlPath, html);

// Render to PDF with the pre-installed Chromium.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href);
await page.waitForTimeout(800);
await page.pdf({ path: join(here, 'fizzplay-box1-print.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Built ${pages.length} pages → print/box1/fizzplay-box1-print.pdf`);
