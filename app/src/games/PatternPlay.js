import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useShake } from '../ui';
import { colors } from '../theme';
import { SHAPE_NAMES, Shape } from '../shapes';

const ROUNDS = 6;
const PIECES = [
  { type: 'circle', fill: colors.coral },
  { type: 'square', fill: colors.sea },
  { type: 'triangle', fill: colors.sun },
  { type: 'star', fill: colors.plum },
  { type: 'heart', fill: colors.leaf },
];
// Each rule repeats; letters map to pieces. Older kids get longer and trickier rules.
const RULES = { small: ['AB', 'AB', 'AAB', 'AB'], big: ['ABC', 'AAB', 'ABB', 'AABB', 'ABAC'] };

const same = (a, b) => a.type === b.type && a.fill === b.fill;

function makeRounds(big) {
  return Array.from({ length: ROUNDS }, (_, i) => {
    const rule = RULES[big ? 'big' : 'small'][i % RULES[big ? 'big' : 'small'].length];
    const letters = [...new Set(rule)];
    const pieces = shuffle(PIECES).slice(0, letters.length);
    const map = Object.fromEntries(letters.map((l, k) => [l, pieces[k]]));
    const length = big ? Math.max(7, rule.length * 2 + 1) : 5;
    const seq = Array.from({ length }, (_, k) => map[rule[k % rule.length]]);
    const answer = seq[seq.length - 1];
    const shown = seq.slice(0, -1);
    const others = shuffle(PIECES.filter((p) => !same(p, answer))).slice(0, big ? 3 : 2);
    return { shown, answer, options: shuffle([answer, ...others]) };
  });
}

export default function PatternPlay() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];
  const size = big ? 38 : 48;

  const pick = (p, k) => {
    if (!same(p, r.answer)) {
      setMistakes((m) => m + 1);
      setWrong(k);
      shake();
      return;
    }
    setWrong(null);
    speak(SHAPE_NAMES[p.type][lang], lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('pattern', s);
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
        <TopBar title={t('g_pattern')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.sun} />
        <T center style={{ color: colors.muted }}>{t('patternHint')}</T>

        {/* Patterns read left to right in both languages, like a line of blocks. */}
        <Pop key={i} style={styles.strip}>
          {r.shown.map((p, k) => (
            <Shape key={k} type={p.type} fill={p.fill} size={size} />
          ))}
          <View style={[styles.slot, { width: size + 8, height: size + 8 }]}>
            <T display style={{ fontSize: 26, color: colors.muted }}>?</T>
          </View>
        </Pop>

        <Animated.View style={[styles.options, shakeStyle]}>
          {r.options.map((p, k) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={SHAPE_NAMES[p.type][lang]}
              onPress={() => pick(p, k)}
              style={({ pressed }) => [styles.option, wrong === k && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.94 }] }]}
            >
              <Shape type={p.type} fill={p.fill} size={64} />
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.line,
    padding: 16,
    direction: 'ltr',
  },
  slot: { borderRadius: 12, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.sun, alignItems: 'center', justifyContent: 'center' },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  option: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, padding: 10 },
});
