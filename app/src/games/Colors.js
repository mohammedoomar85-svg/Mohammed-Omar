import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';

const ROUNDS = 6;
const COLORS = {
  red: { arThe: 'الأحمر', hex: '#E53935', ar: 'أحمر', en: 'red' },
  blue: { arThe: 'الأزرق', hex: '#1E6FD9', ar: 'أزرق', en: 'blue' },
  yellow: { arThe: 'الأصفر', hex: '#FDD835', ar: 'أصفر', en: 'yellow' },
  green: { arThe: 'الأخضر', hex: '#43A047', ar: 'أخضر', en: 'green' },
  orange: { arThe: 'البرتقالي', hex: '#FB8C00', ar: 'برتقالي', en: 'orange' },
  purple: { arThe: 'البنفسجي', hex: '#8E24AA', ar: 'بنفسجي', en: 'purple' },
  pink: { arThe: 'الوردي', hex: '#F48FB1', ar: 'وردي', en: 'pink' },
  brown: { arThe: 'البني', hex: '#795548', ar: 'بني', en: 'brown' },
  black: { hex: '#212121', ar: 'أسود', en: 'black' },
  white: { hex: '#FFFFFF', ar: 'أبيض', en: 'white' },
  gray: { hex: '#9E9E9E', ar: 'رمادي', en: 'grey' },
};
// Paint mixing for older kids.
const MIXES = [
  { a: 'red', b: 'yellow', out: 'orange' },
  { a: 'blue', b: 'yellow', out: 'green' },
  { a: 'red', b: 'blue', out: 'purple' },
  { a: 'red', b: 'white', out: 'pink' },
  { a: 'black', b: 'white', out: 'gray' },
];
const BASIC = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown'];

function makeRounds(big) {
  if (big) {
    return shuffle([...MIXES, MIXES[0]]).slice(0, ROUNDS).map((m) => ({
      ...m,
      answer: m.out,
      options: shuffle([m.out, ...shuffle(['orange', 'green', 'purple', 'pink', 'gray', 'brown'].filter((c) => c !== m.out)).slice(0, 3)]),
    }));
  }
  return shuffle(BASIC)
    .slice(0, ROUNDS)
    .map((c) => ({ answer: c, options: shuffle([c, ...shuffle(BASIC.filter((x) => x !== c)).slice(0, 3)]) }));
}

function Blob({ c, size = 72 }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: COLORS[c].hex, borderWidth: 3, borderColor: 'rgba(0,0,0,0.12)' }} />;
}

export default function Colors() {
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
  const name = (c) => COLORS[c][lang];

  const pick = (c) => {
    if (c !== r.answer) {
      setMistakes((m) => m + 1);
      setWrong(c);
      shake();
      return;
    }
    setWrong(null);
    speak(name(c), lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('colors', s);
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
        <TopBar title={t('g_colors')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.coral} />

        <Pop key={i} style={styles.card}>
          {big ? (
            <>
              <T display center style={{ fontSize: 20 }}>{t('colorMix')}</T>
              <View style={{ flexDirection: row, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <View style={styles.paint}><Blob c={r.a} size={64} /><T bold center>{name(r.a)}</T></View>
                <T display style={{ fontSize: 34 }}>+</T>
                <View style={styles.paint}><Blob c={r.b} size={64} /><T bold center>{name(r.b)}</T></View>
                <T display style={{ fontSize: 34 }}>=</T>
                <View style={[styles.paint]}><View style={styles.mystery}><T display style={{ fontSize: 28 }}>?</T></View></View>
              </View>
            </>
          ) : (
            <T display center style={{ fontSize: 30 }}>
              {lang === 'ar' ? 'وين اللون ' : 'Where is '}
              <T display style={{ fontSize: 30, color: r.answer === 'yellow' ? '#C9A400' : COLORS[r.answer].hex }}>
                {lang === 'ar' ? COLORS[r.answer].arThe : name(r.answer)}
              </T>
              {lang === 'ar' ? '؟' : '?'}
            </T>
          )}
          <Pressable onPress={() => speak(big ? `${name(r.a)} + ${name(r.b)}` : name(r.answer), lang, state.sound)} style={styles.listen} accessibilityRole="button">
            <T bold style={{ fontSize: 14 }}>🔊 {t('listen')}</T>
          </Pressable>
        </Pop>

        <Animated.View style={[styles.options, shakeStyle]}>
          {r.options.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={name(c)}
              onPress={() => pick(c)}
              style={({ pressed }) => [styles.option, wrong === c && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.93 }] }]}
            >
              <Blob c={c} />
              {big && <T bold center style={{ fontSize: 14 }}>{name(c)}</T>}
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 18, gap: 12, alignItems: 'center' },
  paint: { alignItems: 'center', gap: 4 },
  mystery: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  listen: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.bg },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  option: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, padding: 12, alignItems: 'center', gap: 6, minWidth: 96 },
});
