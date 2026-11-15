export const colors = {
  bg: '#FFFBF2',
  surface: '#FFFFFF',
  band: '#FFF1D6',
  ink: '#1B2A4A',
  muted: '#55607A',
  line: '#E9DFC9',
  sea: '#0A7F96',
  seaSoft: '#D6F0F4',
  sun: '#FFC23D',
  sunDark: '#D99A12',
  coral: '#F2604F',
  leaf: '#2E9E62',
  plum: '#7B5CC9',
  shadow: '#2B3550',
};

export const fonts = {
  display: 'BalooBhaijaan2_800ExtraBold',
  displayBold: 'BalooBhaijaan2_700Bold',
  body: 'Tajawal_500Medium',
  bodyBold: 'Tajawal_700Bold',
};

// Home screen sections, in display order.
export const sections = [
  { id: 'numbers', icon: '🔢', color: colors.leaf },
  { id: 'letters', icon: '✏️', color: colors.coral },
  { id: 'shapes', icon: '🔷', color: colors.sea },
  { id: 'science', icon: '🌿', color: colors.plum },
];

// Every game: its section, colour and icon. `free` games open on phones without a box code
// (on the website every game is open as a free trial).
export const games = [
  { id: 'count', section: 'numbers', color: colors.leaf, icon: '🔢', free: true },
  { id: 'balance', section: 'numbers', color: colors.leaf, icon: '⚖️', free: false },
  { id: 'letters', section: 'letters', color: colors.coral, icon: '✏️', free: false },
  { id: 'words', section: 'letters', color: colors.plum, icon: '🐚', free: false },
  { id: 'firstletter', section: 'letters', color: colors.coral, icon: '🔤', free: true },
  { id: 'letterhunt', section: 'letters', color: colors.sea, icon: '🎯', free: false },
  { id: 'shapes', section: 'shapes', color: colors.sun, icon: '🔷', free: true },
  { id: 'build', section: 'shapes', color: colors.sea, icon: '🧱', free: false },
  { id: 'pattern', section: 'shapes', color: colors.sun, icon: '🧩', free: false },
  { id: 'memory', section: 'science', color: colors.plum, icon: '🃏', free: true },
];
