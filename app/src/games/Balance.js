import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';
import { num, sayNumber } from '../i18n';

const ROUNDS = 6;
const ITEMS = ['🍎', '🍊', '🧸', '🐚', '🍓', '⚽'];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const TILT = 8;

// Little ones: which side has more (heavier)? Older kids: how many blocks to add so both sides are equal?
function makeRounds(big) {
  return Array.from({ length: ROUNDS }, (_, i) => {
    if (big) {
      const left = rand(5, 10);
      const right = rand(1, left - 1);
      const answer = left - right;
      const opts = new Set([answer]);
      while (opts.size < 3) opts.add(Math.max(1, answer + rand(-3, 3)));
      return { left, right, answer, options: shuffle([...opts]), item: '🧱' };
    }
    const gap = i < 2 ? rand(2, 3) : 1;
    const small = rand(1, 5 - gap);
    const heavyLeft = Math.random() < 0.5;
    return {
      left: heavyLeft ? small + gap : small,
      right: heavyLeft ? small : small + gap,
      answer: heavyLeft ? 'left' : 'right',
      item: ITEMS[i % ITEMS.length],
    };
  });
}

function Pan({ count, item, extra, onPress, label, highlight }) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.panWrap, pressed && onPress && { transform: [{ scale: 0.96 }] }]}
    >
      <View style={[styles.items]}>
        {Array.from({ length: count }, (_, k) => (
          <T key={k} style={{ fontSize: count > 6 ? 18 : 24 }}>{item}</T>
        ))}
        {extra}
      </View>
      <View style={[styles.pan, highlight && { backgroundColor: colors.sun }]} />
    </Pressable>
  );
}

export default function Balance() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const tilt = useRef(new Animated.Value(0)).current;
  const r = rounds[i];

  // Older kids start with the scale leaning to the heavy left side.
  useEffect(() => {
    tilt.setValue(big ? -TILT : 0);
  }, [i, big, seed, tilt]);

  const moveTo = (deg) =>
    Animated.spring(tilt, { toValue: deg, friction: 5, useNativeDriver: Platform.OS !== 'web' }).start();

  const next = () => {
    setTimeout(() => {
      setSolved(false);
      setWrong(null);
      if (i + 1 >= ROUNDS) {
        const s = starsFor(mistakes);
        recordGame('balance', s);
        setDone(s);
      } else setI(i + 1);
    }, 1100);
  };

  const pickSide = (side) => {
    if (solved) return;
    if (side !== r.answer) {
      setMistakes((m) => m + 1);
      setWrong(side);
      shake();
      return;
    }
    setSolved(true);
    moveTo(side === 'left' ? -TILT : TILT);
    speak(sayNumber(Math.max(r.left, r.right), lang), lang, state.sound);
    next();
  };

  const pickNumber = (n) => {
    if (solved) return;
    if (n !== r.answer) {
      setMistakes((m) => m + 1);
      setWrong(n);
      shake();
      return;
    }
    setSolved(true);
    moveTo(0);
    speak(sayNumber(n, lang), lang, state.sound);
    next();
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setMistakes(0);
    setSolved(false);
    setDone(null);
  };

  const rotate = tilt.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] });
  const added = big && solved ? r.answer : 0;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_balance')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.leaf} />
        <T display center style={{ fontSize: 21 }}>{big ? t('balanceBig') : t('balanceSmall')}</T>

        {/* The scale is drawn left-to-right in both languages, like a real one. */}
        <Animated.View style={[styles.stage, shakeStyle]}>
          <Animated.View style={[styles.beamGroup, { transform: [{ rotate }] }]}>
            <View style={styles.pans}>
              <Pan
                count={r.left}
                item={r.item}
                label={num(r.left, lang)}
                highlight={!big && wrong === 'left'}
                onPress={big ? undefined : () => pickSide('left')}
              />
              <Pan
                count={r.right + added}
                item={r.item}
                label={num(r.right, lang)}
                highlight={!big && wrong === 'right'}
                onPress={big ? undefined : () => pickSide('right')}
                extra={
                  big && !solved ? (
                    <View style={styles.question}>
                      <T display style={{ fontSize: 18, color: '#fff' }}>?</T>
                    </View>
                  ) : null
                }
              />
            </View>
            <View style={styles.beam} />
          </Animated.View>
          <View style={styles.fulcrum} />
          <View style={styles.base} />
        </Animated.View>

        {big ? (
          <>
            <T center style={{ fontSize: 22 }}>
              {num(r.left, lang)} = {num(r.right, lang)} + {lang === 'ar' ? '؟' : '?'}
            </T>
            <View style={{ flexDirection: row, justifyContent: 'center', gap: 14 }}>
              {r.options.map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  onPress={() => pickNumber(n)}
                  style={({ pressed }) => [styles.num, wrong === n && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.93 }] }]}
                >
                  <T display center style={{ fontSize: 36 }}>{num(n, lang)}</T>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.line,
    paddingTop: 30,
    paddingHorizontal: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  beamGroup: { width: '100%', maxWidth: 360, alignItems: 'center' },
  pans: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', direction: 'ltr' },
  panWrap: { width: '46%', alignItems: 'center' },
  items: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', minHeight: 64, gap: 2, paddingHorizontal: 4 },
  pan: { width: '100%', height: 14, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: colors.sea },
  beam: { width: '100%', height: 8, borderRadius: 4, backgroundColor: colors.ink, marginTop: 6 },
  fulcrum: { width: 0, height: 0, borderLeftWidth: 22, borderRightWidth: 22, borderBottomWidth: 46, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.ink },
  base: { width: 120, height: 10, borderRadius: 5, backgroundColor: colors.ink, marginBottom: 16 },
  question: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  num: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.line,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
