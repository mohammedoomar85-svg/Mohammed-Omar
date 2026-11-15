import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useShake } from '../ui';
import { colors } from '../theme';
import { ANIMALS, TRIAL_SOUNDS, playAnimal } from '../sounds';

const ROUNDS = 6;
// Older kids hear animals that sound alike (cow/sheep/donkey, cat/owl, frog/duck).
const ALIKE = { cow: ['sheep', 'donkey', 'horse'], sheep: ['cow', 'donkey', 'cat'], donkey: ['horse', 'cow', 'sheep'], horse: ['donkey', 'cow', 'lion'],
  cat: ['owl', 'dog', 'lion'], owl: ['cat', 'duck', 'rooster'], frog: ['duck', 'bee', 'owl'], duck: ['frog', 'rooster', 'owl'],
  dog: ['lion', 'cat', 'donkey'], lion: ['dog', 'cat', 'horse'], bee: ['frog', 'duck', 'owl'], rooster: ['duck', 'owl', 'cat'] };
const byId = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

function makeRounds(big) {
  return shuffle(ANIMALS)
    .slice(0, ROUNDS)
    .map((a) => {
      const pool = big ? ALIKE[a.id] : shuffle(ANIMALS.map((x) => x.id).filter((id) => id !== a.id));
      return { ...a, options: shuffle([a.id, ...pool.slice(0, big ? 3 : 2)]) };
    });
}

export default function AnimalSounds() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(big), [big, seed]);
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const pulse = useRef(new Animated.Value(1)).current;
  const r = rounds[i];

  const play = () => {
    setHeard(true);
    playAnimal(r, lang, state.sound);
    pulse.setValue(0.85);
    Animated.spring(pulse, { toValue: 1, friction: 3, useNativeDriver: false }).start();
  };

  // After the first tap, each new round plays its sound by itself.
  useEffect(() => {
    if (i > 0) setTimeout(() => playAnimal(rounds[i], lang, state.sound), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const pick = (id) => {
    if (id !== r.id) {
      setMistakes((m) => m + 1);
      setWrong(id);
      shake();
      return;
    }
    setWrong(null);
    speak(r[lang], lang, state.sound);
    if (i + 1 >= ROUNDS) {
      const s = starsFor(mistakes);
      recordGame('sounds', s);
      setDone(s);
    } else setI(i + 1);
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setHeard(false);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_sounds')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.plum} />
        {TRIAL_SOUNDS && (
          <View style={styles.trialTag}>
            <T bold center style={{ fontSize: 12, color: colors.muted }}>{t('soundsTrial')}</T>
          </View>
        )}
        <Pop key={i} style={styles.card}>
          <T display center style={{ fontSize: 22 }}>{t('soundsHint')}</T>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('listen')} onPress={play} style={styles.speaker}>
              <T style={{ fontSize: 56, textAlign: 'center' }}>🔊</T>
            </Pressable>
          </Animated.View>
          {/* With sound off, show the sound as words so the game still works. */}
          {heard && !state.sound && (
            <View style={styles.bubble}>
              <T display center style={{ fontSize: 22 }}>«{r.say[lang]}»</T>
            </View>
          )}
          {!heard && <T center style={{ color: colors.muted }}>{t('soundsTap')}</T>}
        </Pop>
        <Animated.View style={[styles.options, shakeStyle]}>
          {r.options.map((id) => (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={byId[id][lang]}
              onPress={() => pick(id)}
              style={({ pressed }) => [styles.animal, wrong === id && { borderColor: colors.coral }, pressed && { transform: [{ scale: 0.93 }] }]}
            >
              <T style={{ fontSize: 50, textAlign: 'center' }}>{byId[id].pic}</T>
              <T bold center style={{ fontSize: 14 }}>{byId[id][lang]}</T>
            </Pressable>
          ))}
        </Animated.View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  trialTag: { alignSelf: 'center', backgroundColor: colors.band, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 18, alignItems: 'center', gap: 12 },
  speaker: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.plum, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#5E43A6' },
  bubble: { backgroundColor: colors.band, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  animal: { width: 110, paddingVertical: 10, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.line, borderBottomWidth: 6, alignItems: 'center' },
});
