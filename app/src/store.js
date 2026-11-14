import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fizzplay:v1';

export const emptyStats = () => ({
  shapes: { plays: 0, stars: 0, best: 0 },
  build: { plays: 0, stars: 0, best: 0 },
  letters: { plays: 0, stars: 0, best: 0 },
  count: { plays: 0, stars: 0, best: 0 },
  words: { plays: 0, stars: 0, best: 0 },
});

export const initialState = () => ({
  lang: null, // 'ar' | 'en'
  child: null, // { name, age: 'small' | 'big' }
  boxUnlocked: false,
  stamps: [], // ids: box1, shapes, build, letters, count, words
  stats: emptyStats(),
  sound: true,
});

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    return { ...initialState(), ...saved, stats: { ...emptyStats(), ...(saved.stats || {}) } };
  } catch {
    return initialState();
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private browsing); the app keeps working in memory.
  }
}

// Demo codes until box codes come from the server.
export function isValidCode(code) {
  const c = code.trim().toUpperCase().replace(/\s/g, '');
  return c === 'FZ-2026' || /^FZ1-\d{4}$/.test(c);
}
