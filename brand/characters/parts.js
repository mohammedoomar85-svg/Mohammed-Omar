// Fizz & Play story characters, built from parts so they can be posed and animated later.
// Every character stands with feet at y=0, centred on x=0. Arm angles: 0 = down, 90 = out sideways, 170 = up.
const C = {
  navy: '#1B2A4A', cream: '#FFFBF2', sun: '#FFC23D', coral: '#F2604F', sea: '#0A7F96', leaf: '#2E9E62',
  skin: '#EDB98A', skin2: '#D9A06F', white: '#FFFFFF', abaya: '#2B3A5C', cane: '#9A6B3F', silver: '#B8C2D6',
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

function arm(sx, sy, side, deg, len, sleeve, skin = C.skin) {
  const a = (deg * Math.PI) / 180;
  const ex = sx + side * len * Math.sin(a), ey = sy + len * Math.cos(a);
  return `<path d="M${sx} ${sy} L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${N}" stroke-width="26" stroke-linecap="round"/>` +
    `<path d="M${sx} ${sy} L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${sleeve}" stroke-width="14" stroke-linecap="round"/>` +
    `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="11" fill="${skin}" stroke="${N}" stroke-width="5"/>`;
}

// Boy: white dishdasha, white ghutra and black agal.
function boy({ expr = 'happy', armL = 12, armR = 12 } = {}) {
  const cx = 0, cy = -250;
  return `<g>
  <ellipse cx="-20" cy="-8" rx="17" ry="8" fill="${N}"/><ellipse cx="20" cy="-8" rx="17" ry="8" fill="${N}"/>
  <path d="M-40 -200 Q-48 -110 -54 -18 L54 -18 Q48 -110 40 -200 Q0 -212 -40 -200 Z" fill="${C.white}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M0 -196 L0 -130" stroke="${N}" stroke-width="3"/><circle cx="6" cy="-180" r="2.5" fill="${N}"/><circle cx="6" cy="-162" r="2.5" fill="${N}"/>
  ${arm(-40, -190, -1, armL, 82, C.white)}${arm(40, -190, 1, armR, 82, C.white)}
  <path d="M${cx - 56} ${cy + 96} Q${cx - 66} ${cy - 52} ${cx} ${cy - 58} Q${cx + 66} ${cy - 52} ${cx + 56} ${cy + 96} L${cx + 36} ${cy + 82} Q${cx + 46} ${cy - 10} ${cx} ${cy - 12} Q${cx - 46} ${cy - 10} ${cx - 36} ${cy + 82} Z" fill="${C.white}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  ${face(cx, cy, expr)}
  <path d="M${cx - 44} ${cy - 2} Q${cx - 43} ${cy - 48} ${cx} ${cy - 49} Q${cx + 43} ${cy - 48} ${cx + 44} ${cy - 2} Q${cx} ${cy - 26} ${cx - 44} ${cy - 2} Z" fill="${C.white}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <ellipse cx="${cx}" cy="${cy - 46}" rx="40" ry="9" fill="none" stroke="${N}" stroke-width="7" transform="translate(0 4)"/>
  <ellipse cx="${cx}" cy="${cy - 54}" rx="35" ry="7" fill="none" stroke="${N}" stroke-width="6" transform="translate(0 6)"/>
</g>`;
}

// Girl: coral daraa with gold trim, navy bukhnag with gold dots.
function girl({ expr = 'happy', armL = 12, armR = 12 } = {}) {
  const cx = 0, cy = -250;
  return `<g>
  <ellipse cx="-20" cy="-8" rx="16" ry="8" fill="${C.coral}" stroke="${N}" stroke-width="4"/><ellipse cx="20" cy="-8" rx="16" ry="8" fill="${C.coral}" stroke="${N}" stroke-width="4"/>
  <path d="M-40 -200 Q-52 -110 -62 -18 L62 -18 Q52 -110 40 -200 Q0 -212 -40 -200 Z" fill="${C.coral}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M-58 -34 L58 -34" stroke="${C.sun}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 11"/>
  <path d="M0 -140 L0 -44" stroke="${C.sun}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 11"/>
  ${arm(-40, -190, -1, armL, 82, C.coral)}${arm(40, -190, 1, armR, 82, C.coral)}
  <path d="M${cx - 58} ${cy + 100} Q${cx - 70} ${cy - 56} ${cx} ${cy - 60} Q${cx + 70} ${cy - 56} ${cx + 58} ${cy + 100} Q${cx} ${cy + 116} ${cx - 58} ${cy + 100} Z" fill="${N}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M${cx - 54} ${cy + 97} Q${cx} ${cy + 112} ${cx + 54} ${cy + 97}" fill="none" stroke="${C.sun}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 11"/>
  ${face(cx, cy + 4, expr)}
  <path d="M${cx - 45} ${cy + 4} Q${cx - 43} ${cy - 45} ${cx} ${cy - 46} Q${cx + 43} ${cy - 45} ${cx + 45} ${cy + 4} Q${cx} ${cy - 22} ${cx - 45} ${cy + 4} Z" fill="${N}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M${cx - 42} ${cy + 3} Q${cx} ${cy - 21} ${cx + 42} ${cy + 3}" fill="none" stroke="${C.sun}" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>
  <circle cx="${cx}" cy="${cy - 30}" r="5" fill="${C.sun}"/>
</g>`;
}

// Grandma (al-yadda): dark abaya over the head, sea-green daraa underneath, round glasses, a cane.
function grandma({ expr = 'kind' } = {}) {
  const cx = 0, cy = -320;
  return `<g>
  <ellipse cx="-22" cy="-8" rx="17" ry="8" fill="${N}"/><ellipse cx="22" cy="-8" rx="17" ry="8" fill="${N}"/>
  <path d="M${cx} ${cy - 62} Q${cx - 74} ${cy - 56} ${cx - 68} ${cy + 30} Q${cx - 84} ${cy + 170} ${cx - 90} -18 L${cx + 90} -18 Q${cx + 84} ${cy + 170} ${cx + 68} ${cy + 30} Q${cx + 74} ${cy - 56} ${cx} ${cy - 62} Z" fill="${C.abaya}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M0 -248 L-26 -18 L26 -18 Z" fill="${C.sea}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M0 -200 L0 -30" stroke="${C.sun}" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 10"/>
  ${arm(-52, -240, -1, 22, 70, C.abaya, C.skin2)}
  <path d="M70 -192 Q68 -212 86 -210 L98 -14" fill="none" stroke="${N}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 -192 Q68 -212 86 -210 L98 -14" fill="none" stroke="${C.cane}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  ${arm(56, -236, 1, 30, 58, C.abaya, C.skin2)}
  <circle cx="${cx}" cy="${cy}" r="44" fill="${C.skin2}" stroke="${N}" stroke-width="${SW}"/>
  ${eyesMouth(cx, cy, expr)}
  <circle cx="${cx - 15}" cy="${cy + 1}" r="13" fill="none" stroke="${N}" stroke-width="3.5"/><circle cx="${cx + 15}" cy="${cy + 1}" r="13" fill="none" stroke="${N}" stroke-width="3.5"/>
  <path d="M${cx - 2} ${cy} L${cx + 2} ${cy}" stroke="${N}" stroke-width="3.5"/>
  <path d="M${cx - 34} ${cy - 2} l-6 -3 M${cx + 34} ${cy - 2} l6 -3" stroke="${N}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M${cx - 46} ${cy + 6} Q${cx - 44} ${cy - 46} ${cx} ${cy - 48} Q${cx + 44} ${cy - 46} ${cx + 46} ${cy + 6} Q${cx + 30} ${cy - 30} ${cx} ${cy - 30} Q${cx - 30} ${cy - 30} ${cx - 46} ${cy + 6} Z" fill="${C.abaya}" stroke="${N}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M${cx - 26} ${cy - 33} Q${cx - 10} ${cy - 40} ${cx + 6} ${cy - 36}" stroke="${C.silver}" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>`;
}

module.exports = { C, boy, girl, grandma, face, eyesMouth };
