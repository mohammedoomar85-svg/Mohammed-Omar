import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useShake } from '../ui';
import { colors } from '../theme';
import { num, sayNumber } from '../i18n';

const ITEMS = ['🐘', '🌳', '🧸', '🐟', '🍎', '🚗', '🏠', '⭐'];
const SIZES = [28, 42, 58, 76];

// Little ones: tap the biggest or smallest of three. Older kids: tap all four from smallest to biggest.
function makeRounds(big) {
  const n = big ? 4 : 6;
  return shuffle(ITEMS)
    .slice(0, n)
    .map((item, i) => {
      const sizes = big ? SIZES : shuffle(SIZES).slice(0, 3).sort((a, b) => a - b);
      const want = big ? 'order' : i % 2 === 0 ? 'big' : 'small';
      return { item, want, pieces: shuffle(sizes.map((size, rank) => ({ size, rank }))) };
    });
}

export default function SizeOrder() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState([]); // ranks already tapped in order (older kids)
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];
  const maxRank = r.pieces.length - 1;

  const advance = () => {
    setPlaced([]);
    setWrong(null);
    if (i + 1 >= rounds.length) {
      const s = starsFor(mistakes);
      recordGame('sizes', s);
      setDone(s);
    } else setI(i + 1);
  };

  const miss = (rank) => {
    setMistakes((m) => m + 1);
    setWrong(rank);
    shake();
  };

  const pick = (p) => {
    if (r.want === 'order') {
      if (placed.includes(p.rank)) return;
      if (p.rank !== placed.length) return miss(p.rank);
      const now = [...placed, p.rank];
      setPlaced(now);
      speak(sayNumber(now.length, lang), lang, state.sound);
      if (now.length === r.pieces.length) setTimeout(advance, 600);
      return;
    }
    const target = r.want === 'big' ? maxRank : 0;
    if (p.rank !== target) return miss(p.rank);
    speak(r.want === 'big' ? t('sizeBig') : t('sizeSmall'), lang, false);
    advance();
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setPlaced([]);
    setMistakes(0);
    setDone(null);
  };

  const prompt = r.want === 'order' ? t('sizeOrder') : r.want === 'big' ? t('sizeBig') : t('sizeSmall');
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_sizes')} onBack={() => go('home')} />
        <Progress value={i} total={rounds.length} color={colors.sun} />
        <T display center style={{ fontSize: 24 }}>{prompt}</T>

        <Pop key={i}>
          <Animated.View style={[styles.shelf, shakeStyle]}>
            {r.pieces.map((p) => {
              const order = placed.indexOf(p.rank);
              return (
                <Pressable
                  key={p.rank}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.item} ${num(p.rank + 1, lang)}`}
                  onPress={() => pick(p)}
                  style={({ pressed }) => [
                    styles.spot,
                    wrong === p.rank && { borderColor: colors.coral },
                    order >= 0 && { borderColor: colors.leaf, backgroundColor: '#E5F5EC' },
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <T style={{ fontSize: p.size, lineHeight: p.size * 1.2 }}>{r.item}</T>
                  {order >= 0 && (
                    <View style={styles.badge}>
                      <T display style={{ fontSize: 15, color: '#fff' }}>{num(order + 1, lang)}</T>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Animated.View>
        </Pop>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.line,
    padding: 12,
    minHeight: 180,
  },
  spot: { flexShrink: 1, minWidth: 0, minHeight: 62, borderRadius: 18, borderWidth: 3, borderColor: colors.line, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 4, paddingVertical: 6 },
  badge: { position: 'absolute', top: -10, right: -10, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.leaf, alignItems: 'center', justifyContent: 'center' },
});
