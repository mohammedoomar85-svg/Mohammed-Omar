import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useShake } from '../ui';
import { colors } from '../theme';
import { SHAPE_NAMES, Shape } from '../shapes';

const EASY = ['circle', 'square', 'triangle', 'star', 'heart', 'semicircle'];
// Older kids get look-alike shapes side by side.
const HARD_GROUPS = [
  ['square', 'rectangle', 'diamond', 'pentagon'],
  ['circle', 'oval', 'semicircle', 'hexagon'],
  ['hexagon', 'pentagon', 'circle', 'star'],
  ['triangle', 'diamond', 'heart', 'semicircle'],
];
const FILLS = [colors.coral, colors.sea, colors.sun, colors.leaf, colors.plum];
const ROUNDS = 6;

function makeRounds(big) {
  return Array.from({ length: ROUNDS }, (_, i) => {
    const options = big ? shuffle(HARD_GROUPS[i % HARD_GROUPS.length]) : shuffle(EASY).slice(0, 3);
    const answer = options[Math.floor(Math.random() * options.length)];
    return { options, answer, fill: FILLS[i % FILLS.length] };
  });
}

export default function ShapeMatch() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(null);
  const [wrong, setWrong] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];

  const pick = (opt) => {
    if (opt !== r.answer) {
      setMistakes((m) => m + 1);
      setWrong(opt);
      shake();
      return;
    }
    setWrong(null);
    speak(SHAPE_NAMES[opt][lang], lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('shapes', s);
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
        <TopBar title={t('g_shapes')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.sun} />
        <T center style={{ color: colors.muted }}>{t('tapShadow')}</T>

        <Pop key={i} style={styles.target}>
          <Shape type={r.answer} fill={r.fill} size={150} />
          <T display center style={{ fontSize: 22 }}>{SHAPE_NAMES[r.answer][lang]}</T>
        </Pop>

        <Animated.View style={[styles.options, shakeStyle]}>
          {r.options.map((o) => (
            <Pressable
              key={o}
              accessibilityRole="button"
              accessibilityLabel={SHAPE_NAMES[o][lang]}
              onPress={() => pick(o)}
              style={({ pressed }) => [
                styles.option,
                wrong === o && { borderColor: colors.coral },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Shape type={o} fill={colors.shadow} size={big ? 72 : 90} />
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  target: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.line,
    padding: 12,
  },
});
