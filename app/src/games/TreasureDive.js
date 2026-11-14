import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';

// Letters are listed in reading order. Arabic letters are shown in their separate form.
const WORDS = {
  ar: {
    small: [
      { word: 'بحر', letters: ['ب', 'ح', 'ر'], pic: '🌊' },
      { word: 'كنز', letters: ['ك', 'ن', 'ز'], pic: '💎' },
      { word: 'قمر', letters: ['ق', 'م', 'ر'], pic: '🌙' },
      { word: 'شمس', letters: ['ش', 'م', 'س'], pic: '☀️' },
    ],
    big: [
      { word: 'سمكة', letters: ['س', 'م', 'ك', 'ة'], pic: '🐟' },
      { word: 'نجمة', letters: ['ن', 'ج', 'م', 'ة'], pic: '⭐' },
      { word: 'قارب', letters: ['ق', 'ا', 'ر', 'ب'], pic: '⛵' },
      { word: 'وردة', letters: ['و', 'ر', 'د', 'ة'], pic: '🌹' },
    ],
    decoys: ['ت', 'ل', 'ف', 'ي', 'ع'],
  },
  en: {
    small: [
      { word: 'SUN', letters: ['S', 'U', 'N'], pic: '☀️' },
      { word: 'CAT', letters: ['C', 'A', 'T'], pic: '🐱' },
      { word: 'BUS', letters: ['B', 'U', 'S'], pic: '🚌' },
      { word: 'SEA', letters: ['S', 'E', 'A'], pic: '🌊' },
    ],
    big: [
      { word: 'FISH', letters: ['F', 'I', 'S', 'H'], pic: '🐟' },
      { word: 'STAR', letters: ['S', 'T', 'A', 'R'], pic: '⭐' },
      { word: 'BOAT', letters: ['B', 'O', 'A', 'T'], pic: '⛵' },
      { word: 'MOON', letters: ['M', 'O', 'O', 'N'], pic: '🌙' },
    ],
    decoys: ['K', 'P', 'L', 'D', 'G'],
  },
};

function makeRound(w, big, decoys) {
  const extra = big ? shuffle(decoys.filter((d) => !w.letters.includes(d))).slice(0, 2) : [];
  return shuffle([...w.letters, ...extra].map((ch, id) => ({ ch, id })));
}

export default function TreasureDive() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const bank = WORDS[lang];
  const [seed, setSeed] = useState(0);
  const words = useMemo(() => shuffle(bank[big ? 'big' : 'small']), [bank, big, seed]);
  const [wi, setWi] = useState(0);
  const w = words[wi];
  const shells = useMemo(() => makeRound(w, big, bank.decoys), [w, big, bank]);
  const [got, setGot] = useState(0);
  const [opened, setOpened] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const complete = got >= w.letters.length;

  const tap = (s) => {
    if (complete || opened.includes(s.id)) return;
    if (s.ch !== w.letters[got]) {
      setMistakes((m) => m + 1);
      shake();
      return;
    }
    const n = got + 1;
    setGot(n);
    setOpened([...opened, s.id]);
    if (n >= w.letters.length) speak(w.word, lang, state.sound);
  };

  const nextWord = () => {
    if (wi + 1 >= words.length) {
      const s = starsFor(mistakes);
      recordGame('words', s);
      setDone(s);
    } else {
      setWi(wi + 1);
      setGot(0);
      setOpened([]);
    }
  };

  const again = () => {
    setSeed(seed + 1);
    setWi(0);
    setGot(0);
    setOpened([]);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen bg="#E6F6F8">
        <TopBar title={t('g_words')} onBack={() => go('home')} />
        <Progress value={wi + (complete ? 1 : 0)} total={words.length} color={colors.plum} />

        <View style={styles.card}>
          <T style={{ fontSize: 64, textAlign: 'center' }}>{w.pic}</T>
          {complete ? (
            <Pop>
              <T display center style={{ fontSize: 44, color: colors.plum }}>{w.word}</T>
            </Pop>
          ) : (
            <View style={{ flexDirection: row, justifyContent: 'center', gap: 8 }}>
              {w.letters.map((ch, k) => (
                <View key={k} style={[styles.slot, k < got && styles.slotOn]}>
                  <T display center style={{ fontSize: 30, color: k < got ? colors.plum : 'transparent' }}>
                    {ch}
                  </T>
                </View>
              ))}
            </View>
          )}
        </View>

        {complete ? (
          <Pop>
            <Pressable onPress={nextWord} style={styles.nextBtn} accessibilityRole="button">
              <T display center style={{ fontSize: 21 }}>{t('next')}</T>
            </Pressable>
          </Pop>
        ) : (
          <>
            <T center style={{ color: colors.muted }}>{t('spell')}</T>
            <Animated.View style={[styles.sea, shakeStyle]}>
              {shells.map((s) => {
                const isOpen = opened.includes(s.id);
                return (
                  <Pressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityLabel={s.ch}
                    onPress={() => tap(s)}
                    style={({ pressed }) => [styles.shell, isOpen && { opacity: 0.25 }, pressed && { transform: [{ scale: 0.92 }] }]}
                  >
                    <T style={{ fontSize: 22, textAlign: 'center' }}>🐚</T>
                    <T display center style={{ fontSize: 30 }}>{s.ch}</T>
                  </Pressable>
                );
              })}
            </Animated.View>
          </>
        )}
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.line,
    padding: 18,
    gap: 12,
  },
  slot: {
    width: 58,
    height: 64,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotOn: { borderStyle: 'solid', backgroundColor: '#EFE9FB' },
  sea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#BFE6EC',
    borderRadius: 28,
    padding: 18,
  },
  shell: {
    width: 78,
    paddingVertical: 8,
    borderRadius: 40,
    backgroundColor: '#FFF6EA',
    borderWidth: 3,
    borderColor: '#F3D9B5',
    alignItems: 'center',
  },
  nextBtn: { backgroundColor: colors.sun, borderRadius: 999, paddingVertical: 14 },
});
