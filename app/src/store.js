import AsyncStorage from '@react-native-async-storage/async-storage';
import { games } from './theme';

const KEY = 'fizzplay:v1';

export const emptyStats = () => Object.fromEntries(games.map((g) => [g.id, { plays: 0, stars: 0, best: 0 }]));

export const initialState = () => ({
  lang: null, // 'ar' | 'en'
  child: null, // { name, age: 'small' | 'big' }
  boxUnlocked: false,
  stamps: [], // 'box1' plus one id per game finished with 3 stars
  stats: emptyStats(),
  sound: true,
  updatedAt: 0,
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
