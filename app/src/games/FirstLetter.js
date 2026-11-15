import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';

const ROUNDS = 6;
const WORDS = {
  ar: [
    { pic: '🦁', word: 'أسد', first: 'أ' },
    { pic: '🦆', word: 'بطة', first: 'ب' },
    { pic: '🍎', word: 'تفاحة', first: 'ت' },
    { pic: '🐪', word: 'جمل', first: 'ج' },
    { pic: '🐴', word: 'حصان', first: 'ح' },
    { pic: '🐻', word: 'دب', first: 'د' },
    { pic: '🦒', word: 'زرافة', first: 'ز' },
    { pic: '🐟', word: 'سمكة', first: 'س' },
    { pic: '☀️', word: 'شمس', first: 'ش' },
    { pic: '🐘', word: 'فيل', first: 'ف' },
    { pic: '🌙', word: 'قمر', first: 'ق' },
    { pic: '🐶', word: 'كلب', first: 'ك' },
    { pic: '🍌', word: 'موز', first: 'م' },
    { pic: '⭐', word: 'نجمة', first: 'ن' },
    { pic: '🌹', word: 'وردة', first: 'و' },
  ],
  en: [
    { pic: '🍎', word: 'Apple', first: 'A' },
    { pic: '🐻', word: 'Bear', first: 'B' },
    { pic: '🐱', word: 'Cat', first: 'C' },
    { pic: '🐶', word: 'Dog', first: 'D' },
    { pic: '🥚', word: 'Egg', first: 'E' },
    { pic: '🐟', word: 'Fish', first: 'F' },
    { pic: '🍇', word: 'Grapes', first: 'G' },
    { pic: '🎩', word: 'Hat', first: 'H' },
    { pic: '🦁', word: 'Lion', first: 'L' },
    { pic: '🌙', word: 'Moon', first: 'M' },
    { pic: '🍊', word: 'Orange', first: 'O' },
    { pic: '🐷', word: 'Pig', first: 'P' },
    { pic: '🐰', word: 'Rabbit', first: 'R' },
    { pic: '☀️', word: 'Sun', first: 'S' },
    { pic: '🌳', word: 'Tree', first: 'T' },
    { pic: '🦓', word: 'Zebra', first: 'Z' },
  ],
};
// Letters that look or sound alike — older kids must tell them apart.
const LOOKALIKE = {
  ب: ['ت', 'ث', 'ن'], ت: ['ب', 'ث', 'ن'], ج: ['ح', 'خ'], ح: ['ج', 'خ'], د: ['ذ', 'ر'], ز: ['ر', 'ذ'],
  س: ['ش', 'ص'], ش: ['س', 'ص'], ف: ['ق', 'غ'], ق: ['ف', 'ك'], ن: ['ب', 'ت'], و: ['ر', 'ز'], ك: ['ق', 'ل'], م: ['ن', 'ع'], أ: ['ل', 'ع'],
  B: ['D', 'P'], D: ['B', 'P'], P: ['B', 'R'], R: ['P', 'B'], C: ['G', 'O'], G: ['C', 'O'], O: ['Q', 'C'], M: ['N', 'W'],
  E: ['F', 'L'], F: ['E', 'P'], L: ['I', 'T'], T: ['I', 'L'], S: ['Z', 'C'], Z: ['S', 'N'], H: ['N', 'A'], A: ['H', 'V'],
};

function makeRounds(lang, big) {
  const pool = WORDS[lang];
  const letters = pool.map((w) => w.first);
  return shuffle(pool)
    .slice(0, ROUNDS)
    .map((w) => {
      const n = big ? 4 : 3;
      const tricky = big ? (LOOKALIKE[w.first] || []).filter((l) => l !== w.first) : [];
      const rest = shuffle(letters.filter((l) => l !== w.first && !tricky.includes(l)));
      const wrong = [...tricky, ...rest].slice(0, n - 1);
      return { ...w, options: shuffle([w.first, ...wrong]) };
    });
}

export default function FirstLetter() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(lang, big), [lang, big, seed]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];

  const pick = (l) => {
    if (l !== r.first) {
      setMistakes((m) => m + 1);
      setWrong(l);
      shake();
      return;
    }
    setWrong(null);
    speak(r.word, lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('firstletter', s);
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
        <TopBar title={t('g_firstletter')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.coral} />
        <T center style={{ color: colors.muted }}>{t('firstHint')}</T>

        <Pop key={i} style={styles.card}>
          <T style={{ fontSize: 96, textAlign: 'center' }}>{r.pic}</T>
          {/* Little ones see the word to help; older kids only hear it. */}
          {!big && <T display center style={{ fontSize: 28 }}>{r.word}</T>}
          <Pressable accessibilityRole="button" onPress={() => speak(r.word, lang, state.sound)} style={styles.listen}>
            <T bold style={{ fontSize: 15 }}>🔊 {t('listen')}</T>
          </Pressable>
        </Pop>

        <Animated.View style={[{ flexDirection: row, justifyContent: 'center', gap: 12, flexWrap: 'wrap' }, shakeStyle]}>
          {r.options.map((l) => (
            <Pressable
              key={l}
              accessibilityRole="button"
              accessibilityLabel={l}
              onPress={() => pick(l)}
              style={({ pressed }) => [styles.letter, wrong === l && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.93 }] }]}
            >
              <T display center style={{ fontSize: 40 }}>{l}</T>
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 16, alignItems: 'center', gap: 6 },
  listen: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.bg },
  letter: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.line,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
