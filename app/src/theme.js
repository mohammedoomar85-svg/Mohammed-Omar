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

// Each game's colour and the skill it builds.
export const games = [
  { id: 'shapes', color: colors.sun, free: true },
  { id: 'build', color: colors.sea, free: false },
  { id: 'letters', color: colors.coral, free: false },
  { id: 'count', color: colors.leaf, free: true },
  { id: 'words', color: colors.plum, free: false },
];
