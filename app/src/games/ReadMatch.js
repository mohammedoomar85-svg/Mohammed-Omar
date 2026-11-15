import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useShake } from '../ui';
import { colors } from '../theme';

const ROUNDS = 6;
// `alike` lists words that look similar, used as tricky choices for older kids.
const WORDS = {
  ar: [
    { word: 'قمر', pic: '🌙', alike: ['قلم', 'تمر'] },
    { word: 'قلم', pic: '✏️', alike: ['قمر', 'علم'] },
    { word: 'بيت', pic: '🏠', alike: ['باب', 'بنت'] },
    { word: 'باب', pic: '🚪', alike: ['بيت', 'ذباب'] },
    { word: 'شمس', pic: '☀️', alike: ['سمك', 'شمع'] },
    { word: 'سمك', pic: '🐟', alike: ['شمس', 'سلك'] },
    { word: 'كرة', pic: '⚽', alike: ['كلب', 'جرة'] },
    { word: 'كلب', pic: '🐶', alike: ['كرة', 'قلب'] },
    { word: 'قلب', pic: '❤️', alike: ['كلب', 'قلم'] },
    { word: 'موز', pic: '🍌', alike: ['ماء', 'موج'] },
    { word: 'ماء', pic: '💧', alike: ['موز', 'نار'] },
    { word: 'نار', pic: '🔥', alike: ['ماء', 'فأر'] },
    { word: 'تمر', pic: '🌴', alike: ['قمر', 'نمر'] },
    { word: 'علم', pic: '🚩', alike: ['قلم', 'عين'] },
  ],
  en: [
    { word: 'CAT', pic: '🐱', alike: ['CAR', 'HAT'] },
    { word: 'CAR', pic: '🚗', alike: ['CAT', 'JAR'] },
    { word: 'HAT', pic: '🎩', alike: ['CAT', 'BAT'] },
    { word: 'BED', pic: '🛏️', alike: ['BEE', 'RED'] },
    { word: 'BEE', pic: '🐝', alike: ['BED', 'TREE'] },
    { word: 'SUN', pic: '☀️', alike: ['BUS', 'SON'] },
    { word: 'BUS', pic: '🚌', alike: ['SUN', 'BUN'] },
    { word: 'DOG', pic: '🐶', alike: ['LOG', 'DIG'] },
    { word: 'PIG', pic: '🐷', alike: ['DIG', 'BIG'] },
    { word: 'BALL', pic: '⚽', alike: ['BELL', 'TALL'] },
    { word: 'BELL', pic: '🔔', alike: ['BALL', 'SHELL'] },
    { word: 'MOON', pic: '🌙', alike: ['MOOSE', 'SPOON'] },
    { word: 'TREE', pic: '🌳', alike: ['BEE', 'THREE'] },
    { word: 'FISH', pic: '🐟', alike: ['DISH', 'FIST'] },
  ],
};

function makeRounds(lang, big) {
  const pool = WORDS[lang];
  const picOf = Object.fromEntries(pool.map((w) => [w.word, w.pic]));
  return shuffle(pool)
    .slice(0, ROUNDS)
    .map((w) => {
      const n = big ? 4 : 3;
      // Tricky choices only count if we have a picture for them.
      const tricky = big ? w.alike.filter((a) => picOf[a]).map((a) => ({ word: a, pic: picOf[a] })) : [];
      const rest = shuffle(pool.filter((x) => x.word !== w.word && !tricky.some((t) => t.word === x.word)));
      const choices = [w, ...tricky, ...rest].slice(0, n);
      return { ...w, options: shuffle(choices) };
    });
}

export default function ReadMatch() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(lang, big), [lang, big, seed]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];

  const pick = (o) => {
    if (o.word !== r.word) {
      setMistakes((m) => m + 1);
      setWrong(o.word);
      shake();
      return;
    }
    setWrong(null);
    speak(r.word, lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('readmatch', s);
      setDone(s);
    } else setI(i + 1);
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_readmatch')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.leaf} />
        <T center style={{ color: colors.muted }}>{t('readHint')}</T>

        <Pop key={i} style={styles.card}>
          <T display center style={{ fontSize: 56, letterSpacing: lang === 'en' ? 4 : 0 }}>{r.word}</T>
          {/* Little ones can listen for help; older kids read on their own. */}
          {!big && (
            <Pressable accessibilityRole="button" onPress={() => speak(r.word, lang, state.sound)} style={styles.listen}>
              <T bold style={{ fontSize: 15 }}>🔊 {t('listen')}</T>
            </Pressable>
          )}
        </Pop>

        <Animated.View style={[styles.options, shakeStyle]}>
          {r.options.map((o) => (
            <Pressable
              key={o.word}
              accessibilityRole="button"
              accessibilityLabel={o.pic}
              onPress={() => pick(o)}
              style={({ pressed }) => [styles.pic, wrong === o.word && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.93 }] }]}
            >
              <T style={{ fontSize: 56, textAlign: 'center' }}>{o.pic}</T>
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, paddingVertical: 22, alignItems: 'center', gap: 10 },
  listen: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.bg },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  pic: { width: 104, height: 104, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, alignItems: 'center', justifyContent: 'center' },
});
