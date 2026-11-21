// Three logo ideas for "فز" = spring up and play.
const fs = require('fs');
const path = require('path');
const textPath = require('../text2path');
const C = { navy: '#1B2A4A', cream: '#FFFBF2', sun: '#FFC23D', coral: '#F2604F', sea: '#0A7F96', leaf: '#2E9E62', belly: '#FFF1CC', ear: '#F79A8D' };
const N = C.navy;

// A: Fizzo springs up out of the toy box.
const boxPop = `
<g stroke="${N}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round">
  <path d="M110 250 L290 250 L270 232 L130 232 Z" fill="${N}"/>
  <path d="M286 300 C340 300 352 250 336 205" fill="none" stroke-width="9"/>
  <path d="M336 205 C326 186 338 166 356 172 C374 180 366 206 344 210 Z" fill="${C.coral}"/>
  <ellipse cx="200" cy="222" rx="50" ry="58" fill="${C.sun}"/>
  <ellipse cx="200" cy="236" rx="28" ry="32" fill="${C.belly}" stroke="none"/>
  <path d="M162 205 L122 160" stroke-width="22"/><path d="M162 205 L122 160" stroke="${C.sun}" stroke-width="9"/>
  <path d="M238 205 L278 160" stroke-width="22"/><path d="M238 205 L278 160" stroke="${C.sun}" stroke-width="9"/>
  <circle cx="119" cy="155" r="11" fill="${C.sun}" stroke-width="7"/><circle cx="281" cy="155" r="11" fill="${C.sun}" stroke-width="7"/>
  <ellipse cx="166" cy="70" rx="27" ry="42" fill="${C.sun}" transform="rotate(-22 166 70)"/>
  <ellipse cx="166" cy="74" rx="14" ry="27" fill="${C.ear}" stroke="none" transform="rotate(-22 166 74)"/>
  <ellipse cx="234" cy="70" rx="27" ry="42" fill="${C.sun}" transform="rotate(22 234 70)"/>
  <ellipse cx="234" cy="74" rx="14" ry="27" fill="${C.ear}" stroke="none" transform="rotate(22 234 74)"/>
  <circle cx="200" cy="138" r="54" fill="${C.sun}"/>
  <ellipse cx="200" cy="160" rx="25" ry="18" fill="${C.belly}" stroke="none"/>
  <ellipse cx="180" cy="128" rx="11" ry="15" fill="${N}" stroke="none"/><ellipse cx="220" cy="128" rx="11" ry="15" fill="${N}" stroke="none"/>
  <circle cx="183" cy="122" r="4.5" fill="#fff" stroke="none"/><circle cx="223" cy="122" r="4.5" fill="#fff" stroke="none"/>
  <ellipse cx="200" cy="150" rx="7" ry="5" fill="${N}" stroke="none"/>
  <path d="M186 160 Q200 182 214 160 Z" fill="${C.coral}" stroke-width="5"/>
  <circle cx="162" cy="152" r="9" fill="${C.coral}" stroke="none" opacity=".45"/><circle cx="238" cy="152" r="9" fill="${C.coral}" stroke="none" opacity=".45"/>
  <rect x="110" y="250" width="180" height="118" rx="10" fill="${C.sea}"/>
  <path d="M110 250 L58 214 L84 192 L134 232 Z" fill="#0C93AD"/>
  <path d="M290 250 L342 214 L316 192 L266 232 Z" fill="#0C93AD"/>
  <path d="M188 250 L188 368 M212 250 L212 368" stroke="${C.sun}" stroke-width="10"/>
</g>
<g stroke="${C.coral}" stroke-width="8" stroke-linecap="round"><path d="M100 96 L78 82 M92 128 L66 126 M300 96 L322 82 M308 128 L334 126 M200 14 L200 -6"/></g>`;

// C: three shapes wake up — asleep, getting up, jumping.
const wakeUp = `
<g stroke="${N}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
  <path d="M20 330 L380 330" stroke="${C.sun}" stroke-width="10"/>
  <rect x="34" y="262" width="68" height="68" rx="14" fill="${C.coral}"/>
  <path d="M50 292 q8 7 16 0 M74 292 q8 7 16 0" fill="none" stroke-width="5"/>
  <text x="96" y="248" font-family="Baloo" font-size="34" fill="${N}" stroke="none">z</text><text x="114" y="222" font-family="Baloo" font-size="24" fill="${N}" stroke="none">z</text>
  <path d="M190 206 L232 280 L148 280 Z" fill="${C.sea}" stroke-width="8"/>
  <path d="M170 280 L166 330 M210 280 L214 330" stroke-width="8"/><ellipse cx="160" cy="330" rx="10" ry="5" fill="${N}" stroke="none"/><ellipse cx="220" cy="330" rx="10" ry="5" fill="${N}" stroke="none"/>
  <circle cx="181" cy="250" r="5" fill="${N}" stroke="none"/><circle cx="201" cy="250" r="5" fill="${N}" stroke="none"/>
  <path d="M184 264 L198 264" stroke-width="4"/>
  <path d="M236 250 Q250 170 278 140" fill="none" stroke="${C.sea}" stroke-width="6" stroke-dasharray="2 16"/>
  <circle cx="312" cy="96" r="46" fill="${C.sun}"/>
  <path d="M294 138 L284 172 M330 138 L340 172" stroke-width="8"/>
  <ellipse cx="280" cy="174" rx="11" ry="6" fill="${N}" stroke="none"/><ellipse cx="344" cy="174" rx="11" ry="6" fill="${N}" stroke="none"/>
  <path d="M270 80 L244 46 M354 80 L380 46" stroke-width="8"/>
  <circle cx="242" cy="42" r="8" fill="${C.sun}" stroke-width="6"/><circle cx="382" cy="42" r="8" fill="${C.sun}" stroke-width="6"/>
  <path d="M294 86 q6 -8 12 0 M318 86 q6 -8 12 0" fill="none" stroke-width="5"/>
  <path d="M296 106 Q312 126 328 106 Z" fill="${C.coral}" stroke-width="5"/>
</g>
<g stroke="${C.coral}" stroke-width="7" stroke-linecap="round"><path d="M300 200 L300 222 M324 200 L324 222"/></g>`;

(async () => {
  // B: the letter ف on a spring; its dot (a yellow ball) flies up.
  const f = await textPath(path.join(__dirname, '../../app/assets/fonts/BalooBhaijaan2_800ExtraBold.ttf'), 'ف');
  const isDot = (s) => { const w = s.bbox[2] - s.bbox[0]; return w > 140 && w < 180; };
  const body = f.subs.filter((s) => !isDot(s));
  const bb = body.reduce((a, s) => [Math.min(a[0], s.bbox[0]), Math.min(a[1], s.bbox[1]), Math.max(a[2], s.bbox[2]), Math.max(a[3], s.bbox[3])], [1e9, 1e9, -1e9, -1e9]);
  const sc = 210 / (bb[2] - bb[0]);
  const tx = 200 - ((bb[0] + bb[2]) / 2) * sc, ty = 220 - bb[3] * sc;
  const glyph = `<g transform="translate(${tx} ${ty}) scale(${sc})"><path d="${body.map((s) => s.d).join('')}" fill="${N}"/></g>`;
  const spring = `<path d="M150 228 L250 244 L150 260 L250 276 L150 292 L250 308 L150 324" fill="none" stroke="${C.sea}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="120" y="326" width="160" height="22" rx="11" fill="${C.coral}"/>`;
  const ball = `<g stroke="${C.sun}" stroke-width="6" stroke-linecap="round"><path d="M262 72 L262 92 M246 68 L240 84 M278 68 L284 84"/></g>
  <circle cx="270" cy="30" r="26" fill="${C.sun}" stroke="${N}" stroke-width="7"/>
  <g stroke="${C.coral}" stroke-width="7" stroke-linecap="round"><path d="M306 24 L328 18 M302 50 L322 60 M240 8 L228 -8"/></g>`;
  const springF = spring + glyph + ball;

  const wm = fs.readFileSync(path.join(__dirname, '../out/wordmark.svg'), 'utf8');
  const card = (title, sub, art) => `<div class="c"><div class="t">${title}</div><div class="s">${sub}</div>
    <svg viewBox="-20 -30 440 410" width="300" style="overflow:visible">${art}</svg>${wm.replace('<svg ', '<svg width="230" ')}</div>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:Baloo;src:url(../../app/assets/fonts/BalooBhaijaan2_800ExtraBold.ttf)}
  @font-face{font-family:Taj;src:url(../../app/assets/fonts/Tajawal_700Bold.ttf)}
  body{margin:0;background:#EFE8D8;padding:28px;width:1144px;display:flex;gap:22px;direction:rtl;font-family:Taj;color:${N}}
  .c{flex:1;background:${C.cream};border-radius:28px;padding:24px 16px 30px;display:flex;flex-direction:column;align-items:center;gap:10px}
  .t{font:800 30px Baloo}.s{font:700 18px Taj;color:#55607A;text-align:center;min-height:50px}
  </style></head><body>
  ${card('أ · يفز من الصندوق', 'فزّو يقوم من الصندوق ويقول: يلا نلعب!', boxPop)}
  ${card('ب · الحرف الناط', 'الفاء على سوستة، ونقطتها تفز لفوق', springF)}
  ${card('ج · نايم ← يقوم ← يفز', 'الأشكال تصحى وتقوم تلعب', wakeUp)}
  </body></html>`;
  fs.writeFileSync(path.join(__dirname, 'sheet.html'), html);
  for (const [n, a] of [['box-pop', boxPop], ['spring-f', springF], ['wake-up', wakeUp]])
    fs.writeFileSync(path.join(__dirname, n + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -30 440 410">${a}</svg>\n`);
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 480 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'sheet.html'));
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(__dirname, 'fazz-concepts.png'), fullPage: true });
  await b.close();
})();
