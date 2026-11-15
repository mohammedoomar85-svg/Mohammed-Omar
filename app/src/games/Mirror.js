import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useShake } from '../ui';
import { colors } from '../theme';

const ROUNDS = 4;
// Half-pictures for the left side. '#' = coloured square. The child mirrors them on the right.
const HALVES = {
  small: [
    ['.#', '##', '.#'], // diamond-ish
    ['#.', '##', '#.'],
    ['.#', '.#', '##'],
    ['##', '.#', '.#'],
    ['#.', '.#', '#.'],
  ],
  big: [
    ['..#', '.##', '###', '..#'], // tree
    ['#..', '##.', '###', '##.'],
    ['.##', '#..', '#.#', '.##'],
    ['..#', '.#.', '#..', '###'],
    ['#.#', '.##', '..#', '.##'],
  ],
};
const FILLS = [colors.coral, colors.sea, colors.leaf, colors.plum];

function makeRounds(big) {
  return shuffle(HALVES[big ? 'big' : 'small'])
    .slice(0, ROUNDS)
    .map((half, i) => {
      const rows = half.length;
      const cols = half[0].length;
      // Squares the child must colour on the right: mirror of each left square.
      const need = [];
      half.forEach((line, r) => [...line].forEach((ch, c) => ch === '#' && need.push(`${r}:${cols * 2 - 1 - c}`)));
      return { half, rows, cols, need, fill: FILLS[i % FILLS.length] };
    });
}

export default function Mirror() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [painted, setPainted] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];
  const cell = big ? 40 : 52;

  const tap = (rr, c) => {
    const key = `${rr}:${c}`;
    if (c < r.cols || painted.includes(key)) return; // left half is the example
    if (!r.need.includes(key)) {
      setMistakes((m) => m + 1);
      setWrong(key);
      shake();
      setTimeout(() => setWrong(null), 500);
      return;
    }
    const now = [...painted, key];
    setPainted(now);
    if (now.length < r.need.length) return;
    speak(lang === 'ar' ? 'برافو' : 'Great', lang, state.sound);
    setTimeout(() => {
      setPainted([]);
      if (i + 1 >= ROUNDS) {
        const s = starsFor(mistakes);
        recordGame('mirror', s);
        setDone(s);
      } else setI(i + 1);
    }, 800);
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setPainted([]);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_mirror')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.plum} />
        <T center style={{ color: colors.muted }}>{t('mirrorHint')}</T>

        <Pop key={i} style={styles.board}>
          <Animated.View style={[{ direction: 'ltr' }, shakeStyle]}>
            {Array.from({ length: r.rows }, (_, rr) => (
              <View key={rr} style={{ flexDirection: 'row' }}>
                {Array.from({ length: r.cols * 2 }, (_, c) => {
                  const key = `${rr}:${c}`;
                  const left = c < r.cols;
                  const on = left ? r.half[rr][c] === '#' : painted.includes(key);
                  return (
                    <Pressable
                      key={c}
                      accessibilityRole={left ? undefined : 'button'}
                      accessibilityLabel={left ? undefined : `${rr + 1}-${c + 1}`}
                      onPress={() => tap(rr, c)}
                      style={[
                        styles.cell,
                        { width: cell, height: cell },
                        left && styles.leftCell,
                        on && { backgroundColor: r.fill },
                        wrong === key && { backgroundColor: '#FBD5D0' },
                        c === r.cols && styles.mirrorEdge,
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </Animated.View>
        </Pop>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 14, alignItems: 'center', gap: 6 },
  cell: { borderWidth: 1, borderColor: colors.line, backgroundColor: '#FFFFFF' },
  leftCell: { backgroundColor: '#F4F1EA' },
  mirrorEdge: { borderLeftWidth: 4, borderLeftColor: colors.ink },
});
