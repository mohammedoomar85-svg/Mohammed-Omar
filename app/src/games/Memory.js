import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Finish, Pop, Progress, Screen, T, TopBar, shuffle, speak, useApp } from '../ui';
import { colors } from '../theme';
import { num } from '../i18n';

// Nature cards: animals, plants and sky, named in both languages.
const CARDS = [
  { pic: '🐪', ar: 'جمل', en: 'camel' },
  { pic: '🐟', ar: 'سمكة', en: 'fish' },
  { pic: '🦅', ar: 'صقر', en: 'falcon' },
  { pic: '🌴', ar: 'نخلة', en: 'palm tree' },
  { pic: '🐢', ar: 'سلحفاة', en: 'turtle' },
  { pic: '🦋', ar: 'فراشة', en: 'butterfly' },
  { pic: '🐝', ar: 'نحلة', en: 'bee' },
  { pic: '🌙', ar: 'قمر', en: 'moon' },
  { pic: '🌻', ar: 'زهرة', en: 'flower' },
  { pic: '🐘', ar: 'فيل', en: 'elephant' },
];

function makeDeck(pairs) {
  const picks = shuffle(CARDS).slice(0, pairs);
  return shuffle([...picks, ...picks].map((c, i) => ({ ...c, key: i })));
}

export default function Memory() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const pairs = big ? 6 : 3;
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => makeDeck(pairs), [pairs, seed]);
  const [open, setOpen] = useState([]); // keys turned face up right now
  const [found, setFound] = useState([]); // pics already matched
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(null);
  const busy = useRef(false);

  useEffect(() => () => clearTimeout(busy.current), []);

  const flip = (card) => {
    if (busy.current || open.includes(card.key) || found.includes(card.pic)) return;
    const next = [...open, card.key];
    setOpen(next);
    if (next.length < 2) return;
    setTries((n) => n + 1);
    const [a, b] = next.map((k) => deck.find((c) => c.key === k));
    if (a.pic === b.pic) {
      speak(a[lang], lang, state.sound);
      const nowFound = [...found, a.pic];
      setFound(nowFound);
      setOpen([]);
      if (nowFound.length === pairs) {
        // Perfect play is one try per pair; allow a little slack before losing stars.
        const extra = tries + 1 - pairs;
        const stars = extra <= Math.ceil(pairs / 2) ? 3 : extra <= pairs + 1 ? 2 : 1;
        setTimeout(() => {
          recordGame('memory', stars);
          setDone(stars);
        }, 500);
      }
    } else {
      busy.current = setTimeout(() => {
        setOpen([]);
        busy.current = false;
      }, 900);
    }
  };

  const again = () => {
    setSeed(seed + 1);
    setOpen([]);
    setFound([]);
    setTries(0);
    setDone(null);
  };

  const cols = big ? 4 : 3;
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar title={t('g_memory')} onBack={() => go('home')} />
        <Progress value={found.length} total={pairs} color={colors.plum} />
        <T center style={{ color: colors.muted }}>{t('memoryHint')}</T>
        <T center bold style={{ color: colors.muted, fontSize: 14 }}>
          {num(tries, lang)} {t('tries')}
        </T>
        <View style={[styles.grid, { maxWidth: cols * 92 }]}>
          {deck.map((c) => {
            const up = open.includes(c.key) || found.includes(c.pic);
            const matched = found.includes(c.pic);
            return (
              <Pressable
                key={c.key}
                accessibilityRole="button"
                accessibilityLabel={up ? c[lang] : '?'}
                onPress={() => flip(c)}
                style={({ pressed }) => [
                  styles.card,
                  { width: `${100 / cols - 3}%` },
                  up ? styles.cardUp : styles.cardDown,
                  matched && { borderColor: colors.leaf },
                  pressed && !up && { transform: [{ scale: 0.95 }] },
                ]}
              >
                {up ? (
                  <Pop>
                    <T style={{ fontSize: big ? 34 : 42, textAlign: 'center' }}>{c.pic}</T>
                  </Pop>
                ) : (
                  <T display style={{ fontSize: 26, color: '#fff', textAlign: 'center' }}>?</T>
                )}
              </Pressable>
            );
          })}
        </View>
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, alignSelf: 'center', width: '100%' },
  card: { aspectRatio: 0.82, borderRadius: 18, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  cardDown: { backgroundColor: colors.plum, borderColor: '#5E43A6' },
  cardUp: { backgroundColor: colors.surface, borderColor: colors.line },
});
