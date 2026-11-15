import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';
import { num } from '../i18n';

const ROUNDS = 6;
const LEN = 5;
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const CARS = [colors.coral, colors.sea, colors.sun, colors.leaf, colors.plum];

// Little ones count up by one to 10. Older kids skip-count by 2, 5 or 10, or count down.
function makeRounds(big) {
  return Array.from({ length: ROUNDS }, (_, i) => {
    let start, step;
    if (big) {
      const kind = i % 4;
      step = [2, 5, 10, -1][kind];
      start = step === -1 ? rand(8, 20) : step === 2 ? rand(1, 10) * 2 - (i % 2) : step * rand(0, 4);
      if (step === 10) start = 10 * rand(0, 5);
    } else {
      step = 1;
      start = rand(1, 10 - LEN + 1);
    }
    const seq = Array.from({ length: LEN }, (_, k) => start + k * step);
    const hole = big ? rand(1, LEN - 1) : rand(1, LEN - 2);
    const answer = seq[hole];
    // Wrong choices: near the answer, never a number already on the train, never negative.
    const spread = Math.max(1, Math.abs(step));
    const pool = [];
    for (let k = -6; k <= 6; k++) pool.push(answer + k * spread, answer + k);
    const wrong = shuffle([...new Set(pool)].filter((o) => o >= 0 && o !== answer && !seq.includes(o))).slice(0, big ? 3 : 2);
    const opts = [answer, ...wrong];
    return { seq, hole, answer, options: shuffle(opts) };
  });
}

export default function MissingNumber() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];

  const pick = (n) => {
    if (n !== r.answer) {
      setMistakes((m) => m + 1);
      setWrong(n);
      shake();
      return;
    }
    setWrong(null);
    speak(r.seq.join(', '), lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('missing', s);
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
        <TopBar title={t('g_missing')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.coral} />
        <T display center style={{ fontSize: 24 }}>{t('missingHint')}</T>

        {/* A number train: reads right-to-left in Arabic, left-to-right in English. */}
        <Pop key={i} style={styles.track}>
          <View style={{ flexDirection: row, alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
            <T style={{ fontSize: 34, transform: [{ scaleX: row === 'row' ? 1 : -1 }] }}>🚂</T>
            {r.seq.map((n, k) => (
              <View key={k} style={[styles.car, { backgroundColor: k === r.hole ? colors.surface : CARS[k % CARS.length] }, k === r.hole && styles.hole]}>
                <T display center style={{ fontSize: 22, color: k === r.hole ? colors.muted : '#fff' }}>{k === r.hole ? '?' : num(n, lang)}</T>
              </View>
            ))}
          </View>
          <View style={styles.rail} />
        </Pop>

        <Animated.View style={[{ flexDirection: row, justifyContent: 'center', gap: 12, flexWrap: 'wrap' }, shakeStyle]}>
          {r.options.map((n) => (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={num(n, lang)}
              onPress={() => pick(n)}
              style={({ pressed }) => [styles.num, wrong === n && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.93 }] }]}
            >
              <T display center style={{ fontSize: 34 }}>{num(n, lang)}</T>
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, paddingVertical: 18, paddingHorizontal: 8, gap: 4 },
  car: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hole: { borderWidth: 3, borderStyle: 'dashed', borderColor: colors.coral },
  rail: { height: 6, borderRadius: 3, backgroundColor: colors.ink, marginHorizontal: 6 },
  num: { width: 80, height: 80, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, alignItems: 'center', justifyContent: 'center' },
});
