// Builds the Fizz & Play logo files. The letters' dots become the brand shapes:
// ف = yellow circle, ز = coral square, ب = sea triangle.
// Run: npm install && node build.js   (needs Playwright for the PNGs)
const fs = require('fs');
const path = require('path');
const textPath = require('./text2path');
const FONTS = path.join(__dirname, '../app/assets/fonts');
const BALOO = path.join(FONTS, 'BalooBhaijaan2_800ExtraBold.ttf');
const OUT = path.join(__dirname, 'out');
const C = { navy: '#1B2A4A', cream: '#FFFBF2', sun: '#FFC23D', coral: '#F2604F', sea: '#0A7F96', seaLight: '#25A9C2', muted: '#55607A' };

const isDot = (s) => { const w = s.bbox[2] - s.bbox[0], h = s.bbox[3] - s.bbox[1]; return w > 140 && w < 180 && h > 140 && h < 180; };
const center = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];

const circle = (x, y, fill) => `<circle cx="${x}" cy="${y}" r="98" fill="${fill}"/>`;
const square = (x, y, fill) => `<rect x="${x - 82}" y="${y - 82}" width="164" height="164" rx="34" fill="${fill}" transform="rotate(12 ${x} ${y})"/>`;
const tri = (x, y, fill) => `<path d="M${x} ${y - 82} L${x + 92} ${y + 74} L${x - 92} ${y + 74} Z" fill="${fill}" stroke="${fill}" stroke-width="36" stroke-linejoin="round"/>`;

async function wordmark(ink, triColor) {
  const r = await textPath(BALOO, 'فز و العب');
  const dots = r.subs.filter(isDot).map((s) => center(s.bbox)).sort((a, b) => a[0] - b[0]); // left→right: ب, ز, ف
  const body = r.subs.filter((s) => !isDot(s)).map((s) => s.d).join('');
  const [b, z, f] = dots;
  const shapes = tri(b[0], b[1] + 20, triColor) + square(z[0], z[1] - 10, C.coral) + circle(f[0], f[1] - 20, C.sun);
  return { svg: `<path d="${body}" fill="${ink}"/>${shapes}`, width: r.width, top: -900, bottom: 290 };
}

async function latin(text, color, spacing) {
  const r = await textPath(BALOO, text);
  // add letter spacing by shifting each glyph's subpaths: simpler to rebuild per char
  let x = 0, d = '';
  for (const ch of text) {
    const g = await textPath(BALOO, ch);
    d += `<g transform="translate(${x} 0)"><path d="${g.subs.map((s) => s.d).join('')}" fill="${color}"/></g>`;
    x += g.width + spacing;
  }
  return { svg: d, width: x - spacing };
}

async function icoGlyph(ink) {
  const r = await textPath(BALOO, 'ف');
  const dot = r.subs.find(isDot);
  const body = r.subs.filter((s) => !isDot(s)).map((s) => s.d).join('');
  const [x, y] = center(dot.bbox);
  const bb = r.subs.reduce((a, s) => [Math.min(a[0], s.bbox[0]), Math.min(a[1], s.bbox[1]), Math.max(a[2], s.bbox[2]), Math.max(a[3], s.bbox[3])], [1e9, 1e9, -1e9, -1e9]);
  return { svg: `<path d="${body}" fill="${ink}"/>${circle(x, y - 20, C.sun)}`, bbox: [bb[0], bb[1] - 120, bb[2], bb[3]] };
}

const svgDoc = (vb, inner, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}">${bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : ''}${inner}</svg>\n`;

async function stacked(dark) {
  const w = await wordmark(dark ? C.cream : C.navy, dark ? C.seaLight : C.sea);
  const en = await latin('FIZZ & PLAY', dark ? C.sun : C.muted, 70);
  const scale = (w.width * 0.62) / en.width;
  const enX = (w.width - en.width * scale) / 2, enY = w.bottom + 120 + 700 * scale;
  const pad = 140;
  const vb = [-pad, w.top - pad, w.width + pad * 2, enY + pad + 40 - (w.top - pad)];
  return { vb, inner: w.svg + `<g transform="translate(${enX} ${enY}) scale(${scale})">${en.svg}</g>` };
}

async function iconSvg(bg, ink, frac) {
  const g = await icoGlyph(ink);
  const [x0, y0, x1, y1] = g.bbox, gw = x1 - x0, gh = y1 - y0;
  const S = 1024, s = (S * frac) / Math.max(gw, gh);
  const tx = (S - gw * s) / 2 - x0 * s, ty = (S - gh * s) / 2 - y0 * s;
  return svgDoc([0, 0, S, S], `<g transform="translate(${tx} ${ty}) scale(${s})">${g.svg}</g>`, bg);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const files = {};
  for (const dark of [false, true]) {
    const s = await stacked(dark);
    files[`logo${dark ? '-dark' : ''}.svg`] = svgDoc(s.vb, s.inner);
    const w = await wordmark(dark ? C.cream : C.navy, dark ? C.seaLight : C.sea);
    files[`wordmark${dark ? '-dark' : ''}.svg`] = svgDoc([-60, w.top - 40, w.width + 120, w.bottom - w.top + 80], w.svg);
  }
  {
    const w = await wordmark('currentColor', 'var(--logo-tri, #0A7F96)');
    files['wordmark-inline.svg'] = svgDoc([-60, w.top - 40, w.width + 120, w.bottom - w.top + 80], w.svg).replace('<svg ', '<svg class="wordmark" role="img" aria-label="فز و العب · Fizz &amp; Play" ');
  }
  files['icon.svg'] = await iconSvg(C.navy, C.cream, 0.6);
  files['icon-light.svg'] = await iconSvg(C.cream, C.navy, 0.6);
  files['adaptive-foreground.svg'] = await iconSvg(null, C.cream, 0.42);
  files['adaptive-monochrome.svg'] = (await iconSvg(null, '#000000', 0.42)).replace(new RegExp(C.sun, 'g'), '#000000');
  for (const [n, c] of Object.entries(files)) fs.writeFileSync(path.join(OUT, n), c);

  // PNGs
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage();
  async function png(svgName, outFile, W, H, bg) {
    const svg = files[svgName];
    await p.setViewportSize({ width: W, height: H });
    await p.setContent(`<html><body style="margin:0;background:${bg || 'transparent'};display:flex;align-items:center;justify-content:center;width:${W}px;height:${H}px">${svg.replace('<svg ', `<svg style="width:${W}px;height:${H}px" `)}</body></html>`);
    await p.screenshot({ path: outFile, omitBackground: !bg });
  }
  const ratio = (n) => { const vb = files[n].match(/viewBox="([^"]+)"/)[1].split(' ').map(Number); return vb[3] / vb[2]; };
  const lw = 2400;
  await png('logo.svg', path.join(OUT, 'logo.png'), lw, Math.round(lw * ratio('logo.svg')));
  await png('logo-dark.svg', path.join(OUT, 'logo-dark.png'), lw, Math.round(lw * ratio('logo-dark.svg')));
  await png('logo.svg', path.join(OUT, 'logo-on-cream.png'), lw, Math.round(lw * ratio('logo.svg')), C.cream);
  await png('logo-dark.svg', path.join(OUT, 'logo-on-navy.png'), lw, Math.round(lw * ratio('logo-dark.svg')), C.navy);
  await png('wordmark.svg', path.join(OUT, 'wordmark.png'), lw, Math.round(lw * ratio('wordmark.svg')));
  await png('wordmark-dark.svg', path.join(OUT, 'wordmark-dark.png'), lw, Math.round(lw * ratio('wordmark-dark.svg')));
  await png('icon.svg', path.join(OUT, 'icon-1024.png'), 1024, 1024);
  await png('icon.svg', path.join(OUT, 'profile-1080.png'), 1080, 1080);
  // App assets
  const A = path.join(__dirname, '../app/assets');
  await png('icon.svg', path.join(A, 'icon.png'), 1024, 1024);
  await png('icon.svg', path.join(A, 'favicon.png'), 48, 48);
  await png('adaptive-foreground.svg', path.join(A, 'android-icon-foreground.png'), 512, 512);
  await png('adaptive-monochrome.svg', path.join(A, 'android-icon-monochrome.png'), 432, 432);
  await p.setViewportSize({ width: 512, height: 512 });
  await p.setContent(`<body style="margin:0;background:${C.navy}"></body>`);
  await p.screenshot({ path: path.join(A, 'android-icon-background.png') });
  const sq = (n) => { const s = files[n]; return s; };
  const s = await stacked(false);
  const side = Math.max(s.vb[2], s.vb[3]) * 1.15;
  files['splash.svg'] = svgDoc([s.vb[0] - (side - s.vb[2]) / 2, s.vb[1] - (side - s.vb[3]) / 2, side, side], s.inner);
  fs.writeFileSync(path.join(OUT, 'splash.svg'), files['splash.svg']);
  await png('splash.svg', path.join(A, 'splash-icon.png'), 1024, 1024);
  // Website favicon + header logo
  const L = path.join(__dirname, '../landing');
  fs.writeFileSync(path.join(L, 'favicon.svg'), files['icon.svg']);
  await png('icon.svg', path.join(L, 'apple-touch-icon.png'), 180, 180);
  await b.close();
  console.log('done:', fs.readdirSync(OUT).join(', '));
})();
