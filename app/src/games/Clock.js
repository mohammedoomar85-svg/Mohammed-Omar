import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors, fonts } from '../theme';
import { num, sayTime } from '../i18n';

const ROUNDS = 6;
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const label = (h, m, lang) => num(`${h}:${m === 0 ? '00' : '30'}`, lang);

// Little ones read whole hours. Older kids also read half past.
function makeRounds(big) {
  const used = new Set();
  return Array.from({ length: ROUNDS }, () => {
    let h, m;
    do {
      h = rand(1, 12);
      m = big && Math.random() < 0.6 ? 30 : 0;
    } while (used.has(`${h}:${m}`));
    used.add(`${h}:${m}`);
    const key = (x) => `${x.h}:${x.m}`;
    const opts = new Map([[key({ h, m }), { h, m }]]);
    while (opts.size < (big ? 4 : 3)) {
      const o = big && Math.random() < 0.5 ? { h, m: m === 0 ? 30 : 0 } : { h: ((h + rand(1, 10) - 1) % 12) + 1, m: big ? (Math.random() < 0.5 ? 0 : 30) : 0 };
      opts.set(key(o), o);
    }
    return { h, m, options: shuffle([...opts.values()]) };
  });
}

function Face({ h, m, lang, size = 220 }) {
  const c = 100;
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = m * 6;
  const hand = (angle, len) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x2: c + len * Math.cos(rad), y2: c + len * Math.sin(rad) };
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx={c} cy={c} r={94} fill="#FFFFFF" stroke={colors.ink} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, k) => {
        const n = k + 1;
        const rad = ((n * 30 - 90) * Math.PI) / 180;
        return (
          <SvgText key={n} x={c + 72 * Math.cos(rad)} y={c + 72 * Math.sin(rad) + 7} fontSize={20} fontWeight="bold" fill={colors.ink} textAnchor="middle" fontFamily={fonts.bodyBold}>
            {num(n, lang)}
          </SvgText>
        );
      })}
      <Line x1={c} y1={c} {...hand(hourAngle, 38)} stroke={colors.coral} strokeWidth={9} strokeLinecap="round" />
      <Line x1={c} y1={c} {...hand(minAngle, 54)} stroke={colors.sea} strokeWidth={6} strokeLinecap="round" />
      <Circle cx={c} cy={c} r={7} fill={colors.ink} />
    </Svg>
  );
}

export default function Clock() {
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

  const pick = (o) => {
    const k = `${o.h}:${o.m}`;
    if (o.h !== r.h || o.m !== r.m) {
      setMistakes((x) => x + 1);
      setWrong(k);
      shake();
      return;
    }
    setWrong(null);
    speak(sayTime(o.h, o.m, lang), lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('clock', s);
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
        <TopBar title={t('g_clock')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.sea} />
        <T display center style={{ fontSize: 24 }}>{t('clockHint')}</T>
        <Pop key={i} style={styles.card}>
          <Face h={r.h} m={r.m} lang={lang} />
        </Pop>
        <Animated.View style={[{ flexDirection: row, flexWrap: 'wrap', justifyContent: 'center', gap: 12 }, shakeStyle]}>
          {r.options.map((o) => {
            const k = `${o.h}:${o.m}`;
            return (
              <Pressable
                key={k}
                accessibilityRole="button"
                accessibilityLabel={label(o.h, o.m, lang)}
                onPress={() => pick(o)}
                style={({ pressed }) => [styles.option, wrong === k && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.93 }] }]}
              >
                <T display center style={{ fontSize: 30, writingDirection: 'ltr' }}>{label(o.h, o.m, lang)}</T>
              </Pressable>
            );
          })}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 12, alignItems: 'center' },
  option: { minWidth: 110, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, alignItems: 'center' },
});
