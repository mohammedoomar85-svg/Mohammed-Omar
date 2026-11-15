import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';
import { num, sayNumber } from '../i18n';

const ITEMS = ['🐚', '⭐', '🐟', '🍎', '🧱', '🦆'];
const ROUNDS = 6;
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function makeRounds(big) {
  return Array.from({ length: ROUNDS }, (_, i) => {
    const item = ITEMS[i % ITEMS.length];
    if (big) {
      const a = rand(2, 7);
      const b = rand(1, 5);
      const answer = a + b;
      const opts = new Set([answer]);
      while (opts.size < 3) opts.add(Math.max(1, answer + rand(-3, 3)));
      return { item, a, b, answer, options: shuffle([...opts]) };
    }
    // Small kids: start small and grow to 10.
    const answer = rand(1 + Math.floor(i / 2), 4 + i);
    const opts = new Set([answer]);
    while (opts.size < 3) opts.add(Math.max(1, answer + rand(-2, 2)));
    return { item, a: answer, b: 0, answer, options: shuffle([...opts]) };
  });
}

function Group({ n, item }) {
  return (
    <View style={styles.group}>
      {Array.from({ length: n }, (_, k) => (
        <T key={k} style={{ fontSize: 34 }}>{item}</T>
      ))}
    </View>
  );
}

export default function CountMatch() {
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
    speak(sayNumber(n, lang), lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('count', s);
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
        <TopBar title={t('g_count')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.leaf} />
        <T display center style={{ fontSize: 24 }}>{big ? t('howManyTotal') : t('howMany')}</T>

        <Pop key={i} style={styles.board}>
          {big ? (
            <View style={{ flexDirection: row, alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Group n={r.a} item={r.item} />
              <T display style={{ fontSize: 40, color: colors.leaf }}>+</T>
              <Group n={r.b} item={r.item} />
            </View>
          ) : (
            <Group n={r.a} item={r.item} />
          )}
          {big && (
            <T display center style={{ fontSize: 30 }}>
              {num(r.a, lang)} + {num(r.b, lang)} = ؟
            </T>
          )}
        </Pop>

        <Animated.View style={[{ flexDirection: row, justifyContent: 'center', gap: 14 }, shakeStyle]}>
          {r.options.map((n) => (
            <Pressable
              key={n}
              accessibilityRole="button"
              onPress={() => pick(n)}
              style={({ pressed }) => [
                styles.num,
                wrong === n && { borderColor: colors.coral },
                pressed && { transform: [{ scale: 0.93 }] },
              ]}
            >
              <T display center style={{ fontSize: 40 }}>{num(n, lang)}</T>
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.line,
    padding: 18,
    gap: 10,
    minHeight: 180,
    justifyContent: 'center',
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    maxWidth: 260,
    alignSelf: 'center',
  },
  num: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.line,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
