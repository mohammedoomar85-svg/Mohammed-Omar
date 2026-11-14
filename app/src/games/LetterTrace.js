import { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { Finish, Pop, Progress, Screen, T, TopBar, speak, starsFor, useApp } from '../ui';
import { colors } from '../theme';

// Letter strokes in a 300x300 box. Arabic strokes run right to left.
const LETTERS = {
  ar: [
    { ch: 'ب', name: 'باء', word: 'بطة', pic: '🦆', d: 'M 250 120 C 255 195 225 210 150 210 C 75 210 45 195 50 130', dots: [[150, 255]] },
    { ch: 'ت', name: 'تاء', word: 'تفاحة', pic: '🍎', d: 'M 250 120 C 255 195 225 210 150 210 C 75 210 45 195 50 130', dots: [[128, 140], [172, 140]] },
    { ch: 'ن', name: 'نون', word: 'نجمة', pic: '⭐', d: 'M 235 115 C 250 245 50 245 65 115', dots: [[150, 130]] },
    { ch: 'و', name: 'واو', word: 'وردة', pic: '🌹', d: 'M 175 165 C 125 165 120 95 165 95 C 210 95 212 150 192 195 C 172 240 125 258 85 250', dots: [] },
  ],
  en: [
    { ch: 'L', name: 'L', word: 'Lion', pic: '🦁', d: 'M 105 60 L 105 240 L 215 240', dots: [], small: true },
    { ch: 'C', name: 'C', word: 'Cat', pic: '🐱', d: 'M 220 95 C 185 50 85 55 80 150 C 85 245 185 250 220 205', dots: [] },
    { ch: 'O', name: 'O', word: 'Orange', pic: '🍊', d: 'M 150 60 C 60 60 60 240 150 240 C 240 240 240 60 150 60', dots: [] },
    { ch: 'U', name: 'U', word: 'Umbrella', pic: '☂️', d: 'M 90 60 L 90 175 C 90 255 210 255 210 175 L 210 60', dots: [] },
    { ch: 'S', name: 'S', word: 'Sun', pic: '☀️', d: 'M 210 80 C 180 50 100 50 95 100 C 90 150 210 150 205 200 C 200 250 110 255 85 220', dots: [], big: true },
  ],
};

// Turn an M/L/C path into evenly spaced points.
function samplePath(d, spacing) {
  const nums = d.match(/[MLC]|-?\d+(\.\d+)?/g);
  const raw = [];
  let i = 0;
  let cur = [0, 0];
  while (i < nums.length) {
    const cmd = nums[i++];
    const take = (n) => nums.slice(i, (i += n)).map(Number);
    if (cmd === 'M') {
      cur = take(2);
      raw.push(cur);
    } else if (cmd === 'L') {
      const [x, y] = take(2);
      for (let s = 1; s <= 20; s++) raw.push([cur[0] + ((x - cur[0]) * s) / 20, cur[1] + ((y - cur[1]) * s) / 20]);
      cur = [x, y];
    } else if (cmd === 'C') {
      const [x1, y1, x2, y2, x, y] = take(6);
      for (let s = 1; s <= 40; s++) {
        const t = s / 40;
        const m = 1 - t;
        raw.push([
          m * m * m * cur[0] + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x,
          m * m * m * cur[1] + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y,
        ]);
      }
      cur = [x, y];
    }
  }
  const out = [raw[0]];
  let acc = 0;
  for (let k = 1; k < raw.length; k++) {
    acc += Math.hypot(raw[k][0] - raw[k - 1][0], raw[k][1] - raw[k - 1][1]);
    if (acc >= spacing) {
      out.push(raw[k]);
      acc = 0;
    }
  }
  const last = raw[raw.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

export default function LetterTrace() {
  const { state, t, go, lang, recordGame } = useApp();
  const big = state.child.age === 'big';
  const { width } = useWindowDimensions();
  const size = Math.min(width - 64, 320);
  const scale = size / 300;

  const letters = useMemo(
    () => LETTERS[lang].filter((l) => (big ? !l.small : !l.big)),
    [lang, big]
  );
  const [li, setLi] = useState(0);
  const [reached, setReached] = useState(0);
  const [stroke, setStroke] = useState([]);
  const [dotsDone, setDotsDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(null);

  const L = letters[li];
  const pts = useMemo(() => samplePath(L.d, 24), [L]);
  const traced = reached >= pts.length;
  const finished = traced && dotsDone >= L.dots.length;
  const tol = big ? 26 : 34;

  // Keep the latest values for the gesture handler.
  const live = useRef({});
  const spoken = useRef(false);
  live.current = { reached, pts, traced, scale, tol };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !live.current.traced,
        onMoveShouldSetPanResponder: () => !live.current.traced,
        onPanResponderGrant: (e) => handle(e, true),
        onPanResponderMove: (e) => handle(e, false),
        onPanResponderRelease: () => {
          const { reached: r, pts: p } = live.current;
          if (r > 0 && r < p.length) {
            // Lifted the finger early: start this letter again.
            setMistakes((m) => m + 1);
            setReached(0);
            setStroke([]);
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function handle(e, first) {
    const { locationX, locationY } = e.nativeEvent;
    const c = live.current;
    const x = locationX / c.scale;
    const y = locationY / c.scale;
    let r = c.reached;
    if (first && r === 0 && Math.hypot(x - c.pts[0][0], y - c.pts[0][1]) > c.tol * 1.6) return;
    while (r < c.pts.length && Math.hypot(x - c.pts[r][0], y - c.pts[r][1]) < c.tol) r++;
    if (r !== c.reached) {
      live.current.reached = r;
      setReached(r);
    }
    setStroke((s) => (first ? [[x, y]] : [...s, [x, y]]));
  }

  const tapDot = () => {
    const n = dotsDone + 1;
    setDotsDone(n);
  };

  const nextLetter = () => {
    if (li + 1 >= letters.length) {
      const s = starsFor(mistakes);
      recordGame('letters', s);
      setDone(s);
    } else {
      setLi(li + 1);
      setReached(0);
      setStroke([]);
      setDotsDone(0);
    }
  };

  const again = () => {
    setLi(0);
    setReached(0);
    setStroke([]);
    setDotsDone(0);
    setMistakes(0);
    setDone(null);
  };

  if (finished && !spoken.current) {
    spoken.current = true;
    speak(`${L.name}. ${L.word}`, lang, state.sound);
  }
  if (!finished) spoken.current = false;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <TopBar
          title={t('g_letters')}
          onBack={() => go('home')}
          right={
            <Pressable onPress={() => speak(L.name, lang, state.sound)} style={styles.listen} accessibilityRole="button">
              <T bold style={{ fontSize: 14 }}>🔊 {t('listen')}</T>
            </Pressable>
          }
        />
        <Progress value={li + (finished ? 1 : 0)} total={letters.length} color={colors.coral} />
        <T center style={{ color: colors.muted }}>{traced && L.dots.length ? t('tapDots') : t('traceIt')}</T>

        <View style={[styles.pad, { width: size + 24, height: size + 24 }]}>
          <View style={{ width: size, height: size }} {...responder.panHandlers}>
            <View pointerEvents="none">
              <Svg width={size} height={size} viewBox="0 0 300 300">
                <Path d={L.d} stroke={colors.line} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {!big && <Path d={L.d} stroke={colors.muted} strokeWidth={2} strokeDasharray="8,8" fill="none" />}
                {pts.slice(0, reached).length > 1 && (
                  <Polyline
                    points={pts.slice(0, reached).map((p) => p.join(',')).join(' ')}
                    stroke={colors.coral}
                    strokeWidth={22}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
                {!traced && stroke.length > 1 && (
                  <Polyline
                    points={stroke.map((p) => p.join(',')).join(' ')}
                    stroke={colors.coral}
                    strokeOpacity={0.25}
                    strokeWidth={10}
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
                {!traced && pts[reached] && (
                  <Circle cx={pts[reached][0]} cy={pts[reached][1]} r={14} fill={reached === 0 ? colors.leaf : colors.sun} />
                )}
                {traced &&
                  L.dots.map(([dx, dy], k) => (
                    <Circle
                      key={k}
                      cx={dx}
                      cy={dy}
                      r={k < dotsDone ? 14 : 16}
                      fill={k < dotsDone ? colors.coral : 'none'}
                      stroke={colors.coral}
                      strokeWidth={3}
                      strokeDasharray={k < dotsDone ? undefined : '4,4'}
                    />
                  ))}
              </Svg>
            </View>
            {traced &&
              L.dots.map(([dx, dy], k) =>
                k === dotsDone ? (
                  <Pressable
                    key={k}
                    onPress={tapDot}
                    accessibilityRole="button"
                    style={{ position: 'absolute', left: (dx - 30) * scale, top: (dy - 30) * scale, width: 60 * scale, height: 60 * scale }}
                  />
                ) : null
              )}
          </View>
        </View>

        {finished && (
          <Pop style={{ gap: 12, alignItems: 'center' }}>
            <T display center style={{ fontSize: 30 }}>
              {L.pic} {L.word}
            </T>
            <Pressable onPress={nextLetter} style={styles.nextBtn} accessibilityRole="button">
              <T display center style={{ fontSize: 21 }}>{t('next')}</T>
            </Pressable>
          </Pop>
        )}
      </Screen>
      {done && <Finish stars={done} onAgain={again} onHome={() => go('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.line,
    padding: 10,
  },
  listen: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
  },
  nextBtn: { backgroundColor: colors.sun, borderRadius: 999, paddingVertical: 14, alignSelf: 'stretch' },
});
