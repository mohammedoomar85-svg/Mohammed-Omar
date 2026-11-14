import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Set these in app/.env.local (see .env.example). Without them the app runs offline on the device only.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;

export const online = !!supabase;

// Every install gets a silent anonymous account, so progress and box codes follow the child.
async function ensureUser() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;
  const { data: signed, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signed.user;
}

const toRow = (s) => ({
  child_name: s.child?.name ?? null,
  age: s.child?.age ?? null,
  lang: s.lang,
  box_unlocked: s.boxUnlocked,
  stamps: s.stamps,
  stats: s.stats,
  sound: s.sound,
  updated_at: new Date(s.updatedAt || Date.now()).toISOString(),
});

const fromRow = (r) => ({
  lang: r.lang,
  child: r.child_name ? { name: r.child_name, age: r.age || 'small' } : null,
  boxUnlocked: r.box_unlocked,
  stamps: r.stamps || [],
  stats: r.stats || {},
  sound: r.sound,
  updatedAt: Date.parse(r.updated_at),
});

// Bring local and server progress together; the newer copy wins.
export async function syncDown(local) {
  if (!supabase) return local;
  try {
    const user = await ensureUser();
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (data && Date.parse(data.updated_at) > (local.updatedAt || 0)) {
      const server = fromRow(data);
      return {
        ...local,
        ...Object.fromEntries(Object.entries(server).filter(([, v]) => v !== null && v !== undefined)),
        stats: { ...local.stats, ...server.stats },
      };
    }
    if (local.child) await syncUp(local);
  } catch {
    // Offline or not set up yet: keep playing with what's on the device.
  }
  return local;
}

export async function syncUp(state) {
  if (!supabase || !state.child) return;
  try {
    const user = await ensureUser();
    await supabase.from('profiles').upsert({ user_id: user.id, ...toRow(state) });
  } catch {
    // Will try again on the next change.
  }
}

// Returns 'ok' | 'invalid' | 'used' | 'offline'
export async function redeemCode(code) {
  try {
    await ensureUser();
    const { error } = await supabase.rpc('redeem_box_code', { p_code: code });
    if (!error) return 'ok';
    if (/already used/.test(error.message)) return 'used';
    if (/invalid code/.test(error.message)) return 'invalid';
    return 'offline';
  } catch {
    return 'offline';
  }
}

export async function signOut() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch {
    // Nothing to clean up.
  }
}
