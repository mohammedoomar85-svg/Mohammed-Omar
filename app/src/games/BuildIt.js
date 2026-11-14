import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';
import { num } from '../i18n';

// Plans made only from the box's magnetic tiles: squares and triangles.
// s = square, u = triangle pointing up, d = triangle pointing down, . = empty
const PLANS = {
  small: [
    { id: 'house', ar: 'بيت', en: 'House', rows: ['uu', 'ss', 'ss'] },
    { id: 'tree', ar: 'شجرة', en: 'Tree', rows: ['.u.', 'uuu', '.s.', '.s.'] },
    { id: 'rocket', ar: 'صاروخ', en: 'Rocket', rows: ['.u.', '.s.', '.s.', 'usu'] },
    { id: 'boat', ar: 'قارب', en: 'Boat', rows: ['.u..', '.su.', 'ssss'] },
  ],
  big: [
    { id: 'castle', ar: 'قلعة', en: 'Castle', rows: ['u.u.u', 'sssss', 'ss.ss'] },
    { id: 'icecream', ar: 'آيس كريم', en: 'Ice cream', rows: ['.u.', 'sss', 'ddd', '.d.'] },
    { id: 'rocket', ar: 'صاروخ', en: 'Rocket', rows: ['.u.', '.s.', '.s.', 'usu', '.d.'] },
    { id: 'boat', ar: 'سفينة', en: 'Ship', rows: ['.u..', '.su.', 'dssd'] },
  ],
};
const TILE_COLORS = [colors.coral, colors.sea, colors.sun, colors.leaf, colors.plum];
const CELL = 58;

function slotsOf(plan) {
  const out = [];
  plan.rows.forEach((line, r) =>
    [...line].forEach((k, c) => {
      if (k !== '.') out.push({ r, c, k });
    })
  );
  // Build from the bottom up, like real tiles.
  return out.sort((a, b) => b.r - a.r || a.c - b.c);
}

function Piece({ k, x = 0, y = 0, w = CELL, ...p }) {
  if (k === 's') return <Rect x={x + 2} y={y + 2} width={w - 4} height={w - 4} rx={4} {...p} />;
  if (k === 'u') return <Polygon points={`${x + 2},${y + w - 2} ${x + w / 2},${y + 3} ${x + w - 2},${y + w - 2}`} {...p} />;
  return <Polygon points={`${x + 2},${y + 2} ${x + w - 2},${y + 2} ${x + w / 2},${y + w - 3}`} {...p} />;
}

export default function BuildIt() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const plans = useMemo(() => shuffle(PLANS[big ? 'big' : 'small']).slice(0, 3), [big, seed]);
  const [pi, setPi] = useState(0);
  const [filled, setFilled] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();

  const plan = plans[pi];
  const slots = useMemo(() => slotsOf(plan), [plan]);
  const cols = Math.max(...plan.rows.map((l) => l.length));
  const next = slots[filled];
  const tray = big ? ['s', 'u', 'd'] : ['s', 'u'];
  const complete = filled >= slots.length;

  const pick = (k) => {
    if (complete) return;
    if (k !== next.k) {
      setMistakes((m) => m + 1);
      shake();
      return;
    }
    const n = filled + 1;
    setFilled(n);
    if (n >= slots.length) speak(plan[lang], lang, state.sound);
  };

  const nextPlan = () => {
    if (pi + 1 >= plans.length) {
      const s = starsFor(mistakes);
      recordGame('build', s);
      setDone(s);
    } else {
      setPi(pi + 1);
      setFilled(0);
    }
  };

  const again = () => {
    setSeed(seed + 1);
    setPi(0);
    setFilled(0);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_build')} onBack={() => go('home')} />
        <Progress value={pi + (complete ? 1 : 0)} total={plans.length} color={colors.sea} />
        <View style={{ flexDirection: row, justifyContent: 'space-between', alignItems: 'center' }}>
          <T display style={{ fontSize: 26 }}>{plan[lang]}</T>
          <T style={{ color: colors.muted }}>
            {num(filled, lang)} {t('of')} {num(slots.length, lang)} {t('pieces')}
          </T>
        </View>

        <View style={styles.board}>
          <Svg width={cols * CELL} height={plan.rows.length * CELL}>
            {slots.map((s, idx) => {
              const x = s.c * CELL;
              const y = s.r * CELL;
              if (idx < filled)
                return (
                  <Piece
                    key={idx}
                    k={s.k}
                    x={x}
                    y={y}
                    fill={TILE_COLORS[idx % TILE_COLORS.length]}
                    fillOpacity={0.85}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              const isNext = idx === filled;
              return (
                <Piece
                  key={idx}
                  k={s.k}
                  x={x}
                  y={y}
                  fill={isNext ? colors.seaSoft : 'none'}
                  stroke={isNext ? colors.sea : colors.muted}
                  strokeWidth={isNext ? 3 : 2}
                  strokeDasharray={isNext ? undefined : '6,5'}
                />
              );
            })}
          </Svg>
        </View>

        {complete ? (
          <Pop style={{ gap: 12 }}>
            <T display center style={{ fontSize: 28, color: colors.leaf }}>{t('great')}</T>
            <Pressable onPress={nextPlan} style={styles.nextBtn} accessibilityRole="button">
              <T display center style={{ fontSize: 21 }}>{t('next')}</T>
            </Pressable>
          </Pop>
        ) : (
          <>
            <T center style={{ color: colors.muted }}>{t('tapPiece')}</T>
            <Animated.View style={[{ flexDirection: 'row', justifyContent: 'center', gap: 14 }, shakeStyle]}>
              {tray.map((k) => (
                <Pressable
                  key={k}
                  accessibilityRole="button"
                  onPress={() => pick(k)}
                  style={({ pressed }) => [styles.trayBtn, pressed && { transform: [{ scale: 0.93 }] }]}
                >
                  <Svg width={70} height={70}>
                    <Piece k={k} w={70} fill={TILE_COLORS[filled % TILE_COLORS.length]} fillOpacity={0.9} />
                  </Svg>
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}
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
    padding: 16,
    alignItems: 'center',
  },
  trayBtn: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.line,
    borderBottomWidth: 6,
    padding: 10,
  },
  nextBtn: { backgroundColor: colors.sun, borderRadius: 999, paddingVertical: 14 },
});
