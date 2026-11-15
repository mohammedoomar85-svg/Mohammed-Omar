import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';
import { num } from '../i18n';

// Each cycle has four stages; little ones get three of them.
const CYCLES = [
  { ar: 'من بذرة إلى شجرة', en: 'From seed to tree', stages: [
    { pic: '🌰', ar: 'بذرة', en: 'seed' }, { pic: '🌱', ar: 'نبتة', en: 'sprout' }, { pic: '🪴', ar: 'نبات', en: 'plant' }, { pic: '🌳', ar: 'شجرة', en: 'tree' }] },
  { ar: 'من بيضة إلى دجاجة', en: 'From egg to hen', stages: [
    { pic: '🥚', ar: 'بيضة', en: 'egg' }, { pic: '🐣', ar: 'تفقس', en: 'hatching' }, { pic: '🐥', ar: 'كتكوت', en: 'chick' }, { pic: '🐔', ar: 'دجاجة', en: 'hen' }] },
  { ar: 'كبرنا!', en: 'Growing up!', stages: [
    { pic: '👶', ar: 'رضيع', en: 'baby' }, { pic: '🧒', ar: 'طفل', en: 'child' }, { pic: '🧑', ar: 'شاب', en: 'grown-up' }, { pic: '🧓', ar: 'جد', en: 'grandparent' }] },
  { ar: 'يومنا', en: 'Our day', stages: [
    { pic: '🌅', ar: 'الصبح', en: 'morning' }, { pic: '☀️', ar: 'الظهر', en: 'noon' }, { pic: '🌇', ar: 'العصر', en: 'evening' }, { pic: '🌙', ar: 'الليل', en: 'night' }] },
  { ar: 'من يرقة إلى فراشة', en: 'From caterpillar to butterfly', stages: [
    { pic: '🥚', ar: 'بيضة', en: 'egg' }, { pic: '🐛', ar: 'يرقة', en: 'caterpillar' }, { pic: '🍃', ar: 'شرنقة', en: 'cocoon' }, { pic: '🦋', ar: 'فراشة', en: 'butterfly' }] },
];

function makeRounds(big) {
  return shuffle(CYCLES)
    .slice(0, 4)
    .map((c) => {
      const stages = (big ? c.stages : [c.stages[0], c.stages[1], c.stages[3]]).map((s, order) => ({ ...s, order }));
      return { ...c, stages, cards: shuffle(stages) };
    });
}

export default function LifeCycle() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];

  const pick = (card) => {
    if (placed.includes(card.order)) return;
    if (card.order !== placed.length) {
      setMistakes((m) => m + 1);
      setWrong(card.order);
      shake();
      return;
    }
    setWrong(null);
    const now = [...placed, card.order];
    setPlaced(now);
    speak(card[lang], lang, state.sound);
    if (now.length < r.stages.length) return;
    setTimeout(() => {
      speak(r[lang], lang, state.sound);
      setPlaced([]);
      if (i + 1 >= rounds.length) {
        const s = starsFor(mistakes);
        recordGame('lifecycle', s);
        setDone(s);
      } else setI(i + 1);
    }, 1100);
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setPlaced([]);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_lifecycle')} onBack={() => go('home')} />
        <Progress value={i} total={rounds.length} color={colors.leaf} />
        <T center style={{ color: colors.muted }}>{t('lifeHint')}</T>
        <T display center style={{ fontSize: 24 }}>{r[lang]}</T>

        {/* The timeline fills in reading order: right-to-left in Arabic, left-to-right in English. */}
        <Pop key={i} style={[styles.timeline, { flexDirection: row }]}>
          {r.stages.map((s, k) => (
            <View key={k} style={[styles.slot, placed.length > k && styles.slotOn]}>
              {placed.length > k ? (
                <>
                  <T style={{ fontSize: 34, textAlign: 'center' }}>{s.pic}</T>
                  <T bold center style={{ fontSize: 11 }}>{s[lang]}</T>
                </>
              ) : (
                <T display style={{ fontSize: 22, color: colors.muted }}>{num(k + 1, lang)}</T>
              )}
            </View>
          ))}
        </Pop>

        <Animated.View style={[styles.cards, shakeStyle]}>
          {r.cards.map((c) => {
            const used = placed.includes(c.order);
            return (
              <Pressable
                key={c.order}
                accessibilityRole="button"
                accessibilityLabel={c[lang]}
                onPress={() => pick(c)}
                style={({ pressed }) => [styles.card, used && { opacity: 0.25 }, wrong === c.order && { borderColor: colors.coral }, pressed && !used && { transform: [{ scale: 0.94 }] }]}
              >
                <T style={{ fontSize: 46, textAlign: 'center' }}>{c.pic}</T>
                <T bold center style={{ fontSize: 13 }}>{c[lang]}</T>
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
  timeline: { justifyContent: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 14 },
  slot: { width: 72, height: 84, borderRadius: 16, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.line, alignItems: 'center', justifyContent: 'center', padding: 2 },
  slotOn: { borderStyle: 'solid', borderColor: colors.leaf, backgroundColor: '#E5F5EC' },
  cards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  card: { width: 96, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, alignItems: 'center' },
});
