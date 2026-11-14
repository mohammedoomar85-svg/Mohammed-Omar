import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, I18nManager, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { BalooBhaijaan2_700Bold } from '@expo-google-fonts/baloo-bhaijaan-2/700Bold';
import { BalooBhaijaan2_800ExtraBold } from '@expo-google-fonts/baloo-bhaijaan-2/800ExtraBold';
import { Tajawal_500Medium } from '@expo-google-fonts/tajawal/500Medium';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';

import { AppContext } from './src/ui';
import { makeT } from './src/i18n';
import { colors } from './src/theme';
import { initialState, loadState, saveState } from './src/store';
import Welcome from './src/screens/Welcome';
import Home from './src/screens/Home';
import BoxCode from './src/screens/BoxCode';
import Passport from './src/screens/Passport';
import Parents from './src/screens/Parents';
import ShapeMatch from './src/games/ShapeMatch';
import BuildIt from './src/games/BuildIt';
import LetterTrace from './src/games/LetterTrace';
import CountMatch from './src/games/CountMatch';
import TreasureDive from './src/games/TreasureDive';

// We lay out Arabic and English ourselves, so keep the native RTL flip off.
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

const SCREENS = {
  home: Home,
  code: BoxCode,
  passport: Passport,
  parents: Parents,
  shapes: ShapeMatch,
  build: BuildIt,
  letters: LetterTrace,
  count: CountMatch,
  words: TreasureDive,
};

export default function App() {
  const [fontsLoaded] = useFonts({
    BalooBhaijaan2_700Bold,
    BalooBhaijaan2_800ExtraBold,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });
  const [state, setState] = useState(null);
  const [screen, setScreen] = useState('home');

  useEffect(() => {
    loadState().then(setState);
  }, []);

  const update = useCallback((fn) => {
    setState((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : { ...prev, ...fn };
      saveState(next);
      return next;
    });
  }, []);

  // Record a finished game: plays, stars, best score, and a stamp for 3 stars.
  const recordGame = useCallback(
    (id, stars) =>
      update((s) => {
        const st = s.stats[id];
        const stamps = stars === 3 && !s.stamps.includes(id) ? [...s.stamps, id] : s.stamps;
        return {
          ...s,
          stamps,
          stats: { ...s.stats, [id]: { plays: st.plays + 1, stars: st.stars + stars, best: Math.max(st.best, stars) } },
        };
      }),
    [update]
  );

  const reset = useCallback(() => {
    const fresh = initialState();
    saveState(fresh);
    setState(fresh);
    setScreen('home');
  }, []);

  const lang = state?.lang || 'ar';
  const ctx = useMemo(
    () => ({ state, update, recordGame, reset, lang, t: makeT(lang), go: setScreen }),
    [state, update, recordGame, reset, lang]
  );

  if (!fontsLoaded || !state) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.sea} size="large" />
      </View>
    );
  }

  const ready = state.lang && state.child;
  const Current = ready ? SCREENS[screen] || Home : Welcome;

  return (
    <SafeAreaProvider>
      <AppContext.Provider value={ctx}>
        <StatusBar style="dark" />
        <Current key={screen} />
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
