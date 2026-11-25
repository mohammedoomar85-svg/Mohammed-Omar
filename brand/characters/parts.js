// Fizz & Play story characters, built from parts so they can be posed and animated later.
// Every character stands with feet at y=0, centred on x=0. Arm angles: 0 = down, 90 = out sideways, 170 = up.
const C = {
  navy: '#1B2A4A', cream: '#FFFBF2', sun: '#FFC23D', coral: '#F2604F', sea: '#0A7F96', leaf: '#2E9E62',
  skin: '#EDB98A', skin2: '#D9A06F', white: '#FFFFFF', abaya: '#2B3A5C', cane: '#9A6B3F', silver: '#B8C2D6', suit: '#2B3A5C', hair: '#3A2A20', henna: '#A8432B',
};
const N = C.navy;
const SW = 6; // outline width

function eyesMouth(cx, cy, expr) {
  const eye = (x) => {
    if (expr === 'laugh' || expr === 'kind') return `<path d="M${x - 8} ${cy + 4} Q${x} ${cy - 6} ${x + 8} ${cy + 4}" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/>`;
    if (expr === 'surprised') return `<ellipse cx="${x}" cy="${cy + 1}" rx="8" ry="11" fill="${N}"/><circle cx="${x + 2.5}" cy="${cy - 3}" r="3.2" fill="#fff"/>`;
    if (expr === 'thinking') return `<ellipse cx="${x}" cy="${cy + 2}" rx="6.5" ry="8.5" fill="${N}"/><circle cx="${x + 3}" cy="${cy - 2}" r="2.8" fill="#fff"/>`;
    return `<ellipse cx="${x}" cy="${cy + 2}" rx="6.5" ry="8.5" fill="${N}"/><circle cx="${x + 2}" cy="${cy - 1}" r="2.8" fill="#fff"/>`;
  };
  let s = eye(cx - 15) + eye(cx + 15);
  const brow = (d) => `<path d="${d}" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/>`;
  if (expr === 'surprised') s += brow(`M${cx - 23} ${cy - 16} Q${cx - 15} ${cy - 22} ${cx - 7} ${cy - 16}`) + brow(`M${cx + 7} ${cy - 16} Q${cx + 15} ${cy - 22} ${cx + 23} ${cy - 16}`);
  if (expr === 'sad') s += brow(`M${cx - 24} ${cy - 8} L${cx - 8} ${cy - 14}`) + brow(`M${cx + 24} ${cy - 8} L${cx + 8} ${cy - 14}`);
  if (expr === 'thinking') s += brow(`M${cx - 23} ${cy - 11} L${cx - 8} ${cy - 11}`) + brow(`M${cx + 8} ${cy - 17} Q${cx + 16} ${cy - 22} ${cx + 24} ${cy - 15}`);
  // mouth
  if (expr === 'happy' || expr === 'kind') s += `<path d="M${cx - 12} ${cy + 17} Q${cx} ${cy + 32} ${cx + 12} ${cy + 17} Z" fill="${C.coral}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/>`;
  if (expr === 'laugh') s += `<path d="M${cx - 16} ${cy + 14} Q${cx} ${cy + 42} ${cx + 16} ${cy + 14} Z" fill="${C.coral}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/>`;
  if (expr === 'surprised') s += `<ellipse cx="${cx}" cy="${cy + 23}" rx="6" ry="8" fill="${N}"/>`;
  if (expr === 'sad') s += `<path d="M${cx - 10} ${cy + 26} Q${cx} ${cy + 17} ${cx + 10} ${cy + 26}" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/><path d="M${cx + 22} ${cy + 8} q4 8 0 11 q-4 -3 0 -11z" fill="${C.sea}"/>`;
  if (expr === 'thinking') s += `<path d="M${cx - 6} ${cy + 23} L${cx + 9} ${cy + 20}" stroke="${N}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<circle cx="${cx - 27}" cy="${cy + 15}" r="7" fill="${C.coral}" opacity=".35"/><circle cx="${cx + 27}" cy="${cy + 15}" r="7" fill="${C.coral}" opacity=".35"/>`;
  return s;
}

function face(cx, cy, expr, skin = C.skin) {
  return `<circle cx="${cx}" cy="${cy}" r="44" fill="${skin}" stroke="${N}" stroke-width="${SW}"/>` + eyesMouth(cx, cy, expr);
}

function arm(sx, sy, side, deg, len, sleeve, opt = {}) {
  const { skin = C.skin, bare = 0, henna = false, bangle = false } = opt;
  const a = (deg * Math.PI) / 180, dx = side * Math.sin(a), dy = Math.cos(a);
  const P = (t) => [(sx + dx * len * t).toFixed(1), (sy + dy * len * t).toFixed(1)];
  const [ex, ey] = P(1), [wx, wy] = P(1 - bare);
  let s = `<path d="M${sx} ${sy} L${ex} ${ey}" stroke="${N}" stroke-width="26" stroke-linecap="round"/>`;
  if (bare) s += `<path d="M${wx} ${wy} L${ex} ${ey}" stroke="${skin}" stroke-width="14" stroke-linecap="round"/>`;
  s += `<path d="M${sx} ${sy} L${wx} ${wy}" stroke="${sleeve}" stroke-width="14" stroke-linecap="round"/>`;
  if (bangle) {
    const [bx, by] = P(1 - bare * 0.45), px = -dy * 12, py = dx * 12;
    const seg = `M${(+bx + px).toFixed(1)} ${(+by + py).toFixed(1)} L${(bx - px).toFixed(1)} ${(by - py).toFixed(1)}`;
    s += `<path d="${seg}" stroke="${N}" stroke-width="10" stroke-linecap="round"/><path d="${seg}" stroke="${C.sun}" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += `<circle cx="${ex}" cy="${ey}" r="12" fill="${skin}" stroke="${N}" stroke-width="5"/>`;
  if (henna) s += `<circle cx="${ex}" cy="${ey}" r="6" fill="${C.henna}"/><circle cx="${(+ex + dx * 9).toFixed(1)}" cy="${(+ey + dy * 9).toFixed(1)}" r="2.6" fill="${C.henna}"/>`;
  return s;
}

// Fahad: a navy suit, white shirt, coral tie, short hair.
function boy({ expr = 'happy', armL = 12, armR = 12 } = {}) {
  const cx = 0, cy = -250;
  return `<g>
  <ellipse cx="-18" cy="-8" rx="17" ry="8" fill="${N}"/><ellipse cx="18" cy="-8" rx="17" ry="8" fill="${N}"/>
  <path d="M-30 -112 L-30 -14 L-4 -14 L-2 -100 L2 -100 L4 -14 L30 -14 L30 -112 Z" fill="${C.suit}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M-40 -200 Q-46 -150 -48 -100 L48 -100 Q46 -150 40 -200 Q0 -212 -40 -200 Z" fill="${C.suit}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M-18 -204 L0 -146 L18 -204 Z" fill="${C.white}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M-6 -200 L6 -200 L4 -190 L-4 -190 Z M-4 -190 L4 -190 L8 -160 L0 -150 L-8 -160 Z" fill="${C.coral}" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M-18 -204 L-6 -168 M18 -204 L6 -168" stroke="${N}" stroke-width="3"/>
  <circle cx="0" cy="-132" r="4" fill="${C.sun}" stroke="${N}" stroke-width="2"/><circle cx="0" cy="-114" r="4" fill="${C.sun}" stroke="${N}" stroke-width="2"/>
  ${arm(-40, -190, -1, armL, 82, C.suit)}${arm(40, -190, 1, armR, 82, C.suit)}
  ${face(cx, cy, expr)}
  <path d="M${cx - 45} ${cy - 2} Q${cx - 48} ${cy - 54} ${cx} ${cy - 54} Q${cx + 48} ${cy - 54} ${cx + 45} ${cy - 2} Q${cx + 34} ${cy - 24} ${cx + 8} ${cy - 22} Q${cx - 18} ${cy - 36} ${cx - 45} ${cy - 2} Z" fill="${C.hair}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
</g>`;
}

// Lulwa: a long coral dress with a gold sash and hem, long dark hair, a yellow bow.
function girl({ expr = 'happy', armL = 12, armR = 12 } = {}) {
  const cx = 0, cy = -250;
  return `<g>
  <path d="M${cx - 50} ${cy + 96} Q${cx - 64} ${cy - 56} ${cx} ${cy - 56} Q${cx + 64} ${cy - 56} ${cx + 50} ${cy + 96} Q${cx + 34} ${cy + 104} ${cx + 28} ${cy + 60} L${cx - 28} ${cy + 60} Q${cx - 34} ${cy + 104} ${cx - 50} ${cy + 96} Z" fill="${C.hair}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <ellipse cx="-16" cy="-8" rx="14" ry="7" fill="${C.sun}" stroke="${N}" stroke-width="4"/><ellipse cx="16" cy="-8" rx="14" ry="7" fill="${C.sun}" stroke="${N}" stroke-width="4"/>
  <path d="M-36 -200 Q-50 -110 -72 -14 L72 -14 Q50 -110 36 -200 Q0 -212 -36 -200 Z" fill="${C.coral}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M-42 -152 Q0 -140 42 -152" fill="none" stroke="${N}" stroke-width="14" stroke-linecap="round"/><path d="M-42 -152 Q0 -140 42 -152" fill="none" stroke="${C.sun}" stroke-width="7" stroke-linecap="round"/>
  <path d="M-66 -32 Q0 -24 66 -32" fill="none" stroke="${C.sun}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 11"/>
  <path d="M-22 -200 Q0 -184 22 -200" fill="none" stroke="${C.sun}" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>
  ${arm(-38, -190, -1, armL, 80, C.coral)}${arm(38, -190, 1, armR, 80, C.coral)}
  ${face(cx, cy, expr)}
  <path d="M${cx - 45} ${cy} Q${cx - 46} ${cy - 50} ${cx} ${cy - 50} Q${cx + 46} ${cy - 50} ${cx + 45} ${cy} Q${cx + 26} ${cy - 30} ${cx} ${cy - 27} Q${cx - 26} ${cy - 30} ${cx - 45} ${cy} Z" fill="${C.hair}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M${cx + 26} ${cy - 40} l-16 -12 l0 24 z M${cx + 26} ${cy - 40} l16 -12 l0 24 z" fill="${C.sun}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="${cx + 26}" cy="${cy - 40}" r="5" fill="${C.coral}" stroke="${N}" stroke-width="3"/>
</g>`;
}

// Al-yadda: traditional Kuwaiti grandma. Black malfa on the head, green thoub nashal
// with gold embroidery, wide sleeves, henna on both hands and a gold bangle on each wrist, a cane.
function grandma({ expr = 'kind' } = {}) {
  const cx = 0, cy = -320;
  const hands = { skin: C.skin2, bare: 0.3, henna: true, bangle: true };
  return `<g>
  <ellipse cx="-22" cy="-8" rx="17" ry="8" fill="${N}"/><ellipse cx="22" cy="-8" rx="17" ry="8" fill="${N}"/>
  <path d="M-44 -280 Q-96 -160 -102 -14 L102 -14 Q96 -160 44 -280 Q0 -292 -44 -280 Z" fill="${C.leaf}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M-36 -272 L0 -200 L36 -272" fill="none" stroke="${C.sun}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 11"/>
  <path d="M0 -200 L0 -40" stroke="${C.sun}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 12"/>
  <path d="M-96 -34 Q0 -22 96 -34" fill="none" stroke="${C.sun}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 11"/>
  <path d="M-92 -56 Q0 -44 92 -56" fill="none" stroke="${C.sun}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9"/>
  <g fill="${C.sun}"><circle cx="-50" cy="-160" r="3.5"/><circle cx="-62" cy="-110" r="3.5"/><circle cx="-40" cy="-90" r="3.5"/><circle cx="50" cy="-150" r="3.5"/><circle cx="64" cy="-104" r="3.5"/><circle cx="38" cy="-120" r="3.5"/><circle cx="-30" cy="-130" r="3.5"/><circle cx="30" cy="-70" r="3.5"/><circle cx="-70" cy="-70" r="3.5"/><circle cx="72" cy="-62" r="3.5"/></g>
  <path d="M72 -214 Q70 -234 88 -232 L100 -14" fill="none" stroke="${N}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M72 -214 Q70 -234 88 -232 L100 -14" fill="none" stroke="${C.cane}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  ${arm(-50, -262, -1, 25, 74, C.leaf, hands)}
  ${arm(54, -258, 1, 30, 62, C.leaf, hands)}
  <path d="M${cx - 58} ${cy + 76} Q${cx - 70} ${cy - 58} ${cx} ${cy - 62} Q${cx + 70} ${cy - 58} ${cx + 58} ${cy + 76} Q${cx} ${cy + 92} ${cx - 58} ${cy + 76} Z" fill="${N}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <circle cx="${cx}" cy="${cy}" r="44" fill="${C.skin2}" stroke="${N}" stroke-width="${SW}"/>
  ${eyesMouth(cx, cy, expr)}
  <circle cx="${cx - 15}" cy="${cy + 1}" r="13" fill="none" stroke="${N}" stroke-width="3.5"/><circle cx="${cx + 15}" cy="${cy + 1}" r="13" fill="none" stroke="${N}" stroke-width="3.5"/>
  <path d="M${cx - 2} ${cy} L${cx + 2} ${cy}" stroke="${N}" stroke-width="3.5"/>
  <path d="M${cx - 34} ${cy - 2} l-6 -3 M${cx + 34} ${cy - 2} l6 -3" stroke="${N}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M${cx - 46} ${cy + 6} Q${cx - 44} ${cy - 46} ${cx} ${cy - 48} Q${cx + 44} ${cy - 46} ${cx + 46} ${cy + 6} Q${cx + 30} ${cy - 30} ${cx} ${cy - 30} Q${cx - 30} ${cy - 30} ${cx - 46} ${cy + 6} Z" fill="${N}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M${cx - 26} ${cy - 33} Q${cx - 10} ${cy - 40} ${cx + 6} ${cy - 36}" stroke="${C.silver}" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>`;
}

module.exports = { C, boy, girl, grandma, face, eyesMouth };
