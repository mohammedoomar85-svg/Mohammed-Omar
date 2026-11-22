// Concept A v2: a Kuwaiti boy and girl spring up out of the toy box.
const C = { navy: '#1B2A4A', cream: '#FFFBF2', sun: '#FFC23D', coral: '#F2604F', sea: '#0A7F96', skin: '#EDB98A', cheek: '#F2604F', white: '#FFFFFF' };
const N = C.navy;
const face = (x, y) => `
  <circle cx="${x}" cy="${y}" r="40" fill="${C.skin}"/>
  <ellipse cx="${x - 14}" cy="${y + 2}" rx="6.5" ry="8.5" fill="${N}" stroke="none"/><ellipse cx="${x + 14}" cy="${y + 2}" rx="6.5" ry="8.5" fill="${N}" stroke="none"/>
  <circle cx="${x - 12}" cy="${y - 1}" r="2.6" fill="#fff" stroke="none"/><circle cx="${x + 16}" cy="${y - 1}" r="2.6" fill="#fff" stroke="none"/>
  <path d="M${x - 13} ${y + 16} Q${x} ${y + 33} ${x + 13} ${y + 16} Z" fill="${C.coral}" stroke-width="5"/>
  <circle cx="${x - 25}" cy="${y + 15}" r="7" fill="${C.cheek}" stroke="none" opacity=".35"/><circle cx="${x + 25}" cy="${y + 15}" r="7" fill="${C.cheek}" stroke="none" opacity=".35"/>`;
const arm = (x1, y1, x2, y2, sleeve) => `
  <path d="M${x1} ${y1} L${x2} ${y2}" stroke-width="24"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${sleeve}" stroke-width="11"/>
  <circle cx="${x2}" cy="${y2}" r="10" fill="${C.skin}" stroke-width="6"/>`;

// Boy: white dishdasha, white ghutra with a black agal.
const bx = 150, by = 150;
const boy = `
  <path d="M${bx - 44} 262 L${bx - 40} ${by + 40} Q${bx} ${by + 30} ${bx + 40} ${by + 40} L${bx + 44} 262 Z" fill="${C.white}"/>
  <path d="M${bx - 8} ${by + 40} L${bx - 8} ${by + 70} M${bx} ${by + 40} L${bx} ${by + 75}" stroke-width="4"/>
  ${arm(bx - 34, by + 60, bx - 84, by - 40, C.white)}
  ${arm(bx + 30, by + 60, bx + 46, by - 76, C.white)}
  <path d="M${bx - 52} ${by + 58} Q${bx - 62} ${by - 50} ${bx} ${by - 56} Q${bx + 62} ${by - 50} ${bx + 52} ${by + 58} L${bx + 30} ${by + 44} Q${bx + 44} ${by - 10} ${bx} ${by - 12} Q${bx - 44} ${by - 10} ${bx - 30} ${by + 44} Z" fill="${C.white}"/>
  ${face(bx, by)}
  <path d="M${bx - 41} ${by - 4} Q${bx - 40} ${by - 46} ${bx} ${by - 47} Q${bx + 40} ${by - 46} ${bx + 41} ${by - 4} Q${bx} ${by - 26} ${bx - 41} ${by - 4} Z" fill="${C.white}"/>
  <ellipse cx="${bx}" cy="${by - 44}" rx="38" ry="9" fill="none" stroke="${N}" stroke-width="7"/>
  <ellipse cx="${bx}" cy="${by - 52}" rx="34" ry="7" fill="none" stroke="${N}" stroke-width="6"/>`;

// Girl: coral dress, navy bukhnag with gold trim.
const gx = 252, gy = 150;
const girl = `
  <path d="M${gx - 44} 262 L${gx - 40} ${gy + 40} Q${gx} ${gy + 30} ${gx + 40} ${gy + 40} L${gx + 44} 262 Z" fill="${C.coral}"/>
  ${arm(gx - 30, gy + 60, gx - 46, gy - 76, C.coral)}
  ${arm(gx + 34, gy + 60, gx + 84, gy - 40, C.coral)}
  <path d="M${gx - 54} ${gy + 66} Q${gx - 66} ${gy - 54} ${gx} ${gy - 58} Q${gx + 66} ${gy - 54} ${gx + 54} ${gy + 66} Q${gx} ${gy + 80} ${gx - 54} ${gy + 66} Z" fill="${N}"/>
  ${face(gx, gy + 4)}
  <path d="M${gx - 42} ${gy + 2} Q${gx - 40} ${gy - 44} ${gx} ${gy - 45} Q${gx + 40} ${gy - 44} ${gx + 42} ${gy + 2} Q${gx} ${gy - 24} ${gx - 42} ${gy + 2} Z" fill="${N}"/>
  <path d="M${gx - 40} ${gy + 2} Q${gx} ${gy - 24} ${gx + 40} ${gy + 2}" fill="none" stroke="${C.sun}" stroke-width="5" stroke-dasharray="1 9"/>
  <path d="M${gx - 46} ${gy + 52} Q${gx} ${gy + 70} ${gx + 46} ${gy + 52}" fill="none" stroke="${C.sun}" stroke-width="6" stroke-dasharray="1 10"/>
  <circle cx="${gx}" cy="${gy - 30}" r="5" fill="${C.sun}" stroke="none"/>`;

module.exports = `
<g stroke="${N}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round">
  <path d="M80 262 L320 262 L298 244 L102 244 Z" fill="${N}"/>
  ${boy}
  ${girl}
  <rect x="80" y="262" width="240" height="110" rx="10" fill="${C.sea}"/>
  <path d="M80 262 L26 226 L52 202 L106 244 Z" fill="#0C93AD"/>
  <path d="M320 262 L374 226 L348 202 L294 244 Z" fill="#0C93AD"/>
  <path d="M188 262 L188 372 M212 262 L212 372" stroke="${C.sun}" stroke-width="10"/>
</g>
<g stroke="${C.coral}" stroke-width="8" stroke-linecap="round"><path d="M50 120 L28 108 M52 160 L26 160 M352 120 L374 108 M350 160 L376 160 M201 30 L201 8"/></g>`;
