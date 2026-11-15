import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useShake } from '../ui';
import { colors } from '../theme';

const ROUNDS = 6;
const HOMES = {
  sea: { pic: '🌊', ar: 'البحر', en: 'the sea', bg: '#D6F0F4' },
  desert: { pic: '🏜️', ar: 'الصحراء', en: 'the desert', bg: '#FFF1D6' },
  farm: { pic: '🚜', ar: 'المزرعة', en: 'the farm', bg: '#E5F5EC' },
  jungle: { pic: '🌴', ar: 'الغابة', en: 'the jungle', bg: '#DCEFD5' },
  ice: { pic: '🧊', ar: 'الثلج', en: 'the ice', bg: '#EAF4FB' },
  hive: { pic: '🍯', ar: 'خلية النحل', en: 'a hive', bg: '#FFF4CC' },
};
// Older kids get animals that are easy to mix up (a penguin swims, but lives on the ice).
const ANIMALS = {
  small: [
    { pic: '🐟', ar: 'السمكة', en: 'fish', home: 'sea' },
    { pic: '🐪', ar: 'الجمل', en: 'camel', home: 'desert' },
    { pic: '🐄', ar: 'البقرة', en: 'cow', home: 'farm' },
    { pic: '🐒', ar: 'القرد', en: 'monkey', home: 'jungle' },
    { pic: '🐧', ar: 'البطريق', en: 'penguin', home: 'ice' },
    { pic: '🐝', ar: 'النحلة', en: 'bee', home: 'hive' },
    { pic: '🐑', ar: 'الخروف', en: 'sheep', home: 'farm' },
    { pic: '🐙', ar: 'الأخطبوط', en: 'octopus', home: 'sea' },
  ],
  big: [
    { pic: '🐧', ar: 'البطريق', en: 'penguin', home: 'ice', trap: 'sea' },
    { pic: '🦂', ar: 'العقرب', en: 'scorpion', home: 'desert', trap: 'jungle' },
    { pic: '🐳', ar: 'الحوت', en: 'whale', home: 'sea', trap: 'ice' },
    { pic: '🦜', ar: 'الببغاء', en: 'parrot', home: 'jungle', trap: 'farm' },
    { pic: '🐐', ar: 'الماعز', en: 'goat', home: 'farm', trap: 'desert' },
    { pic: '🦎', ar: 'الضب', en: 'lizard', home: 'desert', trap: 'jungle' },
    { pic: '🦭', ar: 'الفقمة', en: 'seal', home: 'ice', trap: 'sea' },
    { pic: '🐝', ar: 'النحلة', en: 'bee', home: 'hive', trap: 'farm' },
  ],
};

function makeRounds(big) {
  const keys = Object.keys(HOMES);
  return shuffle(ANIMALS[big ? 'big' : 'small'])
    .slice(0, ROUNDS)
    .map((a) => {
      const others = shuffle(keys.filter((k) => k !== a.home && k !== a.trap));
      const wrong = big ? [a.trap, ...others].slice(0, 3) : others.slice(0, 2);
      return { ...a, options: shuffle([a.home, ...wrong]) };
    });
}

export default function AnimalHomes() {
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

  const pick = (h) => {
    if (h !== r.home) {
      setMistakes((m) => m + 1);
      setWrong(h);
      shake();
      return;
    }
    setWrong(null);
    speak(`${r[lang]}, ${HOMES[h][lang]}`, lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('homes', s);
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
        <TopBar title={t('g_homes')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.sea} />
        <Pop key={i} style={styles.card}>
          <T style={{ fontSize: 96, textAlign: 'center' }}>{r.pic}</T>
          <T display center style={{ fontSize: 24 }}>
            {lang === 'ar' ? `وين يعيش ${r.ar}؟` : `Where does the ${r.en} live?`}
          </T>
        </Pop>
        <Animated.View style={[styles.options, shakeStyle]}>
          {r.options.map((h) => (
            <Pressable
              key={h}
              accessibilityRole="button"
              accessibilityLabel={HOMES[h][lang]}
              onPress={() => pick(h)}
              style={({ pressed }) => [styles.home, { backgroundColor: HOMES[h].bg }, wrong === h && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.94 }] }]}
            >
              <T style={{ fontSize: 44, textAlign: 'center' }}>{HOMES[h].pic}</T>
              <T bold center style={{ fontSize: 15 }}>{HOMES[h][lang]}</T>
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 16, alignItems: 'center', gap: 4 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  home: { width: 130, paddingVertical: 12, borderRadius: 22, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, alignItems: 'center', gap: 2 },
});
