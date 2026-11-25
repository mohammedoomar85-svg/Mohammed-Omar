const fs = require('fs');
const path = require('path');
const { C, boy, girl, grandma, eyesMouth } = require('./parts');
const N = C.navy;
const jerboa = fs.readFileSync(path.join(__dirname, '../mascot/jerboa.svg'), 'utf8');
const jInner = jerboa.slice(jerboa.indexOf('>') + 1, jerboa.lastIndexOf('</svg>'));
const font = path.join(__dirname, '../../app/assets/fonts');

const at = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
const shadow = (x, y, w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="12" fill="${N}" opacity=".08"/>`;

// Sheet 1: the cast line-up.
const cast = [
  { x: 1370, art: boy({ armL: 20, armR: 150 }), name: 'فهد', role: 'الولد، ٦ سنين', note: 'يحب يبني ويركّب، ويستعجل دايماً' , sw: [C.white, N, C.skin] },
  { x: 1010, art: girl({ armL: 150, armR: 20 }), name: 'لولوة', role: 'البنت، ٦ سنين', note: 'تحب الحروف والأسئلة، وتفكر قبل لا تسوي', sw: [C.coral, N, C.sun] },
  { x: 620, art: grandma(), name: 'اليدّة', role: 'جدتهم', note: 'تحكي القصص وتعطيهم الحكمة', sw: [C.abaya, C.sea, C.skin2] },
];
let s1 = `<rect width="1600" height="900" fill="#EFE8D8"/><rect x="30" y="30" width="1540" height="840" rx="36" fill="${C.cream}"/>
<text x="1530" y="110" text-anchor="end" font-family="Baloo" font-size="54" fill="${N}">شخصيات فز و العب</text>
<text x="1530" y="152" text-anchor="end" font-family="Taj" font-size="24" fill="#55607A">الأسماء اقتراحات، وتقدر تغيّرها</text>`;
for (const c of cast) {
  s1 += shadow(c.x, 650, 90) + at(c.x, 650, 1.15, c.art);
  s1 += `<text x="${c.x}" y="716" text-anchor="middle" font-family="Baloo" font-size="40" fill="${N}">${c.name}</text>
  <text x="${c.x}" y="752" text-anchor="middle" font-family="Taj" font-size="22" fill="#55607A">${c.role}</text>
  <text x="${c.x}" y="786" text-anchor="middle" font-family="Taj" font-size="19" fill="${N}">${c.note}</text>`;
  c.sw.forEach((col, i) => { s1 += `<circle cx="${c.x - 30 + i * 30}" cy="822" r="11" fill="${col}" stroke="${N}" stroke-width="2"/>`; });
}
s1 += shadow(250, 650, 80) + at(110, 470, 0.62, jInner);
s1 += `<text x="250" y="716" text-anchor="middle" font-family="Baloo" font-size="40" fill="${N}">فزّو</text>
<text x="250" y="752" text-anchor="middle" font-family="Taj" font-size="22" fill="#55607A">اليربوع، صاحبهم</text>
<text x="250" y="786" text-anchor="middle" font-family="Taj" font-size="19" fill="${N}">ما يتكلم، ينط ويضحّك</text>`;

// Sheet 2: expressions.
const exprs = [['happy', 'فرحان'], ['laugh', 'يضحك'], ['surprised', 'متفاجئ'], ['sad', 'زعلان'], ['thinking', 'يفكر']];
let s2 = `<rect width="1600" height="900" fill="#EFE8D8"/><rect x="30" y="30" width="1540" height="840" rx="36" fill="${C.cream}"/>
<text x="1530" y="110" text-anchor="end" font-family="Baloo" font-size="54" fill="${N}">تعابير الوجه</text>
<text x="1530" y="152" text-anchor="end" font-family="Taj" font-size="24" fill="#55607A">نفس الوجه بـ ٥ تعابير، عشان نحرّكهم في الحلقات</text>`;
exprs.forEach(([e, label], i) => {
  const x = 1390 - i * 280;
  const headBoy = `<g transform="translate(0 250)">${boy({ expr: e })}</g>`;
  const headGirl = `<g transform="translate(0 250)">${girl({ expr: e })}</g>`;
  s2 += `<svg x="${x - 120}" y="200" width="240" height="250" viewBox="-110 -80 220 230" overflow="hidden">${headBoy}</svg>`;
  s2 += `<svg x="${x - 120}" y="470" width="240" height="250" viewBox="-110 -80 220 230" overflow="hidden">${headGirl}</svg>`;
  s2 += `<text x="${x}" y="780" text-anchor="middle" font-family="Baloo" font-size="36" fill="${N}">${label}</text>`;
  if (e === 'thinking') s2 += `<circle cx="${x + 84}" cy="232" r="7" fill="${C.sea}"/><circle cx="${x + 100}" cy="212" r="10" fill="${C.sea}"/>`;
});

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Baloo;src:url(${font}/BalooBhaijaan2_800ExtraBold.ttf)}@font-face{font-family:Taj;src:url(${font}/Tajawal_700Bold.ttf)}
body{margin:0}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">${body}</svg></body></html>`;

(async () => {
  fs.writeFileSync(path.join(__dirname, 'cast.html'), page(s1));
  fs.writeFileSync(path.join(__dirname, 'expressions.html'), page(s2));
  // standalone character SVGs for the animator
  const one = (name, art, w, h) => fs.writeFileSync(path.join(__dirname, name + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-w / 2} ${-h} ${w} ${h + 10}">${art}</svg>\n`);
  one('fahad', boy(), 260, 330); one('lulwa', girl(), 260, 330); one('yadda', grandma(), 280, 400);
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
  for (const n of ['cast', 'expressions']) {
    await p.goto('file://' + path.join(__dirname, n + '.html'));
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(__dirname, n + '.png') });
  }
  await b.close();
})();
