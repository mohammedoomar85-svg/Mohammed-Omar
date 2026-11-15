import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';

const ROUNDS = 6;
// `why` is a one-line reason shown to older kids after they answer.
const ITEMS = {
  small: [
    { pic: '🪨', ar: 'الحجر', en: 'rock', floats: false },
    { pic: '🦆', ar: 'بطة اللعبة', en: 'toy duck', floats: true },
    { pic: '🪙', ar: 'العملة', en: 'coin', floats: false },
    { pic: '🍃', ar: 'الورقة', en: 'leaf', floats: true },
    { pic: '⚽', ar: 'الكورة', en: 'ball', floats: true },
    { pic: '🔑', ar: 'المفتاح', en: 'key', floats: false },
    { pic: '⛵', ar: 'القارب', en: 'boat', floats: true },
    { pic: '🥄', ar: 'الملعقة', en: 'spoon', floats: false },
  ],
  big: [
    { pic: '🍎', ar: 'التفاحة', en: 'apple', floats: true, why: { ar: 'فيها هوا كثير بين أجزائها.', en: 'It has lots of air inside.' } },
    { pic: '🥚', ar: 'البيضة', en: 'egg', floats: false, why: { ar: 'البيضة الجديدة أثقل من الماي.', en: 'A fresh egg is heavier than water.' } },
    { pic: '🧊', ar: 'الثلج', en: 'ice', floats: true, why: { ar: 'الماي لما يتجمد يصير أخف.', en: 'Water gets lighter when it freezes.' } },
    { pic: '🍊', ar: 'البرتقالة', en: 'orange', floats: true, why: { ar: 'قشرتها فيها فقاعات هوا صغيرة.', en: 'Its peel is full of tiny air bubbles.' } },
    { pic: '🪵', ar: 'الخشب', en: 'wood', floats: true, why: { ar: 'الخشب أخف من الماي.', en: 'Wood is lighter than water.' } },
    { pic: '📎', ar: 'المشبك', en: 'paper clip', floats: false, why: { ar: 'الحديد أثقل من الماي.', en: 'Metal is heavier than water.' } },
    { pic: '🧽', ar: 'الإسفنجة', en: 'sponge', floats: true, why: { ar: 'فيها فتحات مليانة هوا.', en: 'Its holes are full of air.' } },
    { pic: '🍇', ar: 'العنب', en: 'grape', floats: false, why: { ar: 'العنب أثقل من الماي بشوي.', en: 'A grape is a bit heavier than water.' } },
    { pic: '🪨', ar: 'الحجر', en: 'rock', floats: false, why: { ar: 'الحجر ثقيل ومليان.', en: 'A rock is heavy and solid.' } },
  ],
};

export default function FloatSink() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => shuffle(ITEMS[big ? 'big' : 'small']).slice(0, ROUNDS), [big, seed]);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const y = useRef(new Animated.Value(0)).current; // 0 = above the water
  const r = rounds[i];

  useEffect(() => {
    y.setValue(0);
  }, [i, seed, y]);

  const choose = (floats) => {
    if (answered) return;
    if (floats !== r.floats) {
      setMistakes((m) => m + 1);
      setWrong(floats);
      shake();
      return;
    }
    setWrong(null);
    setAnswered(true);
    // Drop it in: floaters bob at the surface, sinkers fall to the bottom.
    Animated.timing(y, { toValue: r.floats ? 62 : 150, duration: 900, useNativeDriver: Platform.OS !== 'web' }).start();
    speak(`${r[lang]}${lang === 'ar' ? '، ' : ', '}${floats ? t('floats') : t('sinks')}`, lang, state.sound);
  };

  const next = () => {
    setAnswered(false);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('float', s);
      setDone(s);
    } else setI(i + 1);
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setAnswered(false);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_float')} onBack={() => go('home')} />
        <Progress value={i + (answered ? 1 : 0)} total={ROUNDS} color={colors.sea} />
        <T display center style={{ fontSize: 22 }}>{t('floatHint')}</T>
        <T display center style={{ fontSize: 26, color: colors.sea }}>{r[lang]}</T>

        <View style={styles.tank}>
          <View style={styles.water} />
          <Animated.View style={[styles.item, { transform: [{ translateY: y }] }]}>
            <T style={{ fontSize: 54 }}>{r.pic}</T>
          </Animated.View>
        </View>

        {answered ? (
          <View style={{ gap: 10 }}>
            <T display center style={{ fontSize: 24, color: colors.leaf }}>{r.floats ? t('floats') : t('sinks')} ✓</T>
            {big && r.why && <T center style={{ color: colors.muted }}>{r.why[lang]}</T>}
            <Pressable onPress={next} style={styles.nextBtn} accessibilityRole="button">
              <T display center style={{ fontSize: 21 }}>{t('next')}</T>
            </Pressable>
          </View>
        ) : (
          <Animated.View style={[{ flexDirection: row, gap: 12 }, shakeStyle]}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('floats')} onPress={() => choose(true)} style={({ pressed }) => [styles.choice, { backgroundColor: '#D6F0F4' }, wrong === true && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.95 }] }]}>
              <T style={{ fontSize: 36, textAlign: 'center' }}>🛟</T>
              <T display center style={{ fontSize: 20 }}>{t('floats')}</T>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t('sinks')} onPress={() => choose(false)} style={({ pressed }) => [styles.choice, { backgroundColor: '#E7E3F7' }, wrong === false && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.95 }] }]}>
              <T style={{ fontSize: 36, textAlign: 'center' }}>⚓</T>
              <T display center style={{ fontSize: 20 }}>{t('sinks')}</T>
            </Pressable>
          </Animated.View>
        )}
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tank: { height: 230, borderRadius: 24, borderWidth: 3, borderColor: colors.sea, backgroundColor: colors.surface, overflow: 'hidden', alignItems: 'center' },
  water: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, backgroundColor: '#8FD3DE' },
  item: { position: 'absolute', top: 6 },
  choice: { flex: 1, paddingVertical: 14, borderRadius: 22, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, alignItems: 'center' },
  nextBtn: { backgroundColor: colors.sun, borderRadius: 999, paddingVertical: 14 },
});
