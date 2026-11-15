import { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, starsFor, useApp, useDir, useShake } from '../ui';
import { colors } from '../theme';
import { num } from '../i18n';

const ROUNDS = 4;
// Target letter with easy decoys (for little ones) and look-alike decoys (for older kids).
const SETS = {
  ar: [
    { target: 'ب', name: 'باء', easy: ['م', 'ع', 'ل', 'و'], hard: ['ت', 'ث', 'ن', 'ي'] },
    { target: 'ج', name: 'جيم', easy: ['س', 'ر', 'ك', 'م'], hard: ['ح', 'خ', 'ع', 'غ'] },
    { target: 'س', name: 'سين', easy: ['ب', 'و', 'د', 'ل'], hard: ['ش', 'ص', 'ض', 'ث'] },
    { target: 'د', name: 'دال', easy: ['م', 'ف', 'ك', 'ي'], hard: ['ذ', 'ر', 'ز', 'و'] },
    { target: 'ف', name: 'فاء', easy: ['ل', 'ر', 'س', 'ع'], hard: ['ق', 'غ', 'و', 'ع'] },
    { target: 'ع', name: 'عين', easy: ['ب', 'ر', 'ن', 'ل'], hard: ['غ', 'ح', 'ج', 'خ'] },
  ],
  en: [
    { target: 'B', name: 'B', easy: ['M', 'O', 'T', 'K'], hard: ['D', 'P', 'R', 'E'] },
    { target: 'S', name: 'S', easy: ['A', 'L', 'H', 'M'], hard: ['Z', 'C', 'G', '5'] },
    { target: 'b', name: 'b', easy: ['m', 'o', 's', 'a'], hard: ['d', 'p', 'q', 'h'] },
    { target: 'M', name: 'M', easy: ['O', 'C', 'S', 'T'], hard: ['N', 'W', 'H', 'V'] },
    { target: 'E', name: 'E', easy: ['O', 'S', 'A', 'U'], hard: ['F', 'L', 'B', 'T'] },
    { target: 'C', name: 'C', easy: ['L', 'T', 'M', 'H'], hard: ['G', 'O', 'Q', 'D'] },
  ],
};

function makeRounds(lang, big) {
  return shuffle(SETS[lang])
    .slice(0, ROUNDS)
    .map((set) => {
      const total = big ? 12 : 6;
      const targets = big ? 4 : 3;
      const decoys = big ? set.hard : set.easy;
      const tiles = [
        ...Array.from({ length: targets }, () => set.target),
        ...Array.from({ length: total - targets }, (_, k) => decoys[k % decoys.length]),
      ];
      return { ...set, targets, tiles: shuffle(tiles.map((ch, id) => ({ ch, id }))) };
    });
}

export default function LetterHunt() {
  const { state, t, go, lang, recordGame } = useApp();
  const { row } = useDir();
  const big = state.child.age === 'big';
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(lang, big), [lang, big, seed]);
  const [i, setI] = useState(0);
  const [caught, setCaught] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(null);
  const [shakeStyle, shake] = useShake();
  const r = rounds[i];
  const left = r.targets - caught.length;

  const tap = (tile) => {
    if (caught.includes(tile.id)) return;
    if (tile.ch !== r.target) {
      setMistakes((m) => m + 1);
      setWrong(tile.id);
      shake();
      return;
    }
    setWrong(null);
    const now = [...caught, tile.id];
    setCaught(now);
    if (now.length < r.targets) return;
    speak(r.name, lang, state.sound);
    setTimeout(() => {
      if (i + 1 >= ROUNDS) {
        const s = starsFor(mistakes);
        recordGame('letterhunt', s);
        setDone(s);
      } else {
        setI(i + 1);
        setCaught([]);
      }
    }, 600);
  };

  const again = () => {
    setSeed(seed + 1);
    setI(0);
    setCaught([]);
    setMistakes(0);
    setDone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_letterhunt')} onBack={() => go('home')} />
        <Progress value={i} total={ROUNDS} color={colors.sea} />

        <Pop key={i} style={[styles.target, { flexDirection: row }]}>
          <View style={styles.targetTile}>
            <T display center style={{ fontSize: 52, color: '#fff' }}>{r.target}</T>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T display style={{ fontSize: 20 }}>{t('huntHint')} «{r.target}»</T>
            <T style={{ color: colors.muted }}>
              {t('huntLeft')}: {num(left, lang)}
            </T>
            <Pressable onPress={() => speak(r.name, lang, state.sound)} style={styles.listen} accessibilityRole="button">
              <T bold style={{ fontSize: 14 }}>🔊 {t('listen')}</T>
            </Pressable>
          </View>
        </Pop>

        <Animated.View style={[styles.pond, shakeStyle]}>
          {r.tiles.map((tile) => {
            const got = caught.includes(tile.id);
            return (
              <Pressable
                key={tile.id}
                accessibilityRole="button"
                accessibilityLabel={tile.ch}
                onPress={() => tap(tile)}
                style={({ pressed }) => [
                  styles.bubble,
                  { width: big ? 64 : 78, height: big ? 64 : 78 },
                  got && styles.got,
                  wrong === tile.id && { borderColor: colors.coral },
                  pressed && !got && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <T display center style={{ fontSize: big ? 30 : 36, color: got ? '#fff' : colors.ink }}>{tile.ch}</T>
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
  target: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 2, borderColor: colors.line, padding: 14, gap: 14, alignItems: 'center' },
  targetTile: { width: 86, height: 86, borderRadius: 22, backgroundColor: colors.sea, alignItems: 'center', justifyContent: 'center' },
  listen: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 2, borderColor: colors.line, marginTop: 4 },
  pond: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, backgroundColor: '#BFE6EC', borderRadius: 28, padding: 16 },
  bubble: { borderRadius: 999, backgroundColor: '#F4FBFC', borderWidth: 3, borderColor: '#8FD3DE', alignItems: 'center', justifyContent: 'center' },
  got: { backgroundColor: colors.sea, borderColor: colors.sea },
});
