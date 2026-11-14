import { createContext, useContext, useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { colors, fonts } from './theme';

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Direction helpers: we flip rows ourselves so Arabic and English both lay out correctly
// on every platform, without depending on the device's RTL setting.
export function useDir() {
  const { lang } = useApp();
  const rtl = lang === 'ar';
  return {
    rtl,
    row: rtl ? 'row-reverse' : 'row',
    align: rtl ? 'right' : 'left',
    start: rtl ? 'flex-end' : 'flex-start',
  };
}

export function speak(text, lang, enabled = true) {
  if (!enabled) return;
  try {
    Speech.stop();
    Speech.speak(text, { language: lang === 'ar' ? 'ar-SA' : 'en-US', rate: 0.85 });
  } catch {
    // Speech is optional; some browsers block it.
  }
}

export function Screen({ children, scroll = true, bg = colors.bg }) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 };
  const inner = <View style={styles.inner}>{children}</View>;
  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.scroll, pad]} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, pad, { flex: 1 }]}>{inner}</View>
      )}
    </View>
  );
}

export function T({ style, display, bold, center, children, ...rest }) {
  const { align, rtl } = useDir();
  const family = display ? fonts.display : bold ? fonts.bodyBold : fonts.body;
  return (
    <Text
      style={[
        { fontFamily: family, color: colors.ink, fontSize: 17, textAlign: center ? 'center' : align, writingDirection: rtl ? 'rtl' : 'ltr' },
        display && { lineHeight: undefined },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Btn({ label, onPress, color = colors.sun, textColor = colors.ink, small, style, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: color, opacity: disabled ? 0.5 : 1, transform: [{ translateY: pressed ? 3 : 0 }] },
        small && styles.btnSmall,
        { borderBottomWidth: pressed ? 1 : 4 },
        style,
      ]}
    >
      <T display center style={{ color: textColor, fontSize: small ? 17 : 21 }}>
        {label}
      </T>
    </Pressable>
  );
}

export function Logo({ big }) {
  const { t } = useApp();
  const s = big ? 22 : 14;
  return (
    <View style={{ alignItems: 'center', gap: big ? 10 : 6 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: s * 2 + 4, gap: 4 }}>
        <View style={{ width: s, height: s, borderRadius: 4, backgroundColor: colors.coral }} />
        <View style={{ width: s, height: s, borderRadius: s, backgroundColor: colors.sun }} />
        <View style={{ width: s, height: s, borderRadius: 4, backgroundColor: colors.sea }} />
        <View style={{ width: s, height: s, borderRadius: 4, backgroundColor: colors.leaf }} />
      </View>
      <T display center style={{ fontSize: big ? 40 : 24 }}>
        {big ? 'فز و العب' : t('appName')}
      </T>
      {big && (
        <T display center style={{ fontSize: 22, color: colors.muted, marginTop: -8 }}>
          Fizz & Play
        </T>
      )}
    </View>
  );
}

export function TopBar({ title, onBack, right }) {
  const { row } = useDir();
  const { t } = useApp();
  return (
    <View style={[styles.topBar, { flexDirection: row }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={onBack} style={styles.backBtn}>
        <T display style={{ fontSize: 22 }}>{'✕'}</T>
      </Pressable>
      <T display style={{ fontSize: 22, flex: 1, marginHorizontal: 12 }} numberOfLines={1}>
        {title}
      </T>
      {right}
    </View>
  );
}

export function Stars({ n, size = 28 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
      {[1, 2, 3].map((i) => (
        <Text key={i} style={{ fontSize: size, opacity: i <= n ? 1 : 0.2 }}>
          {'⭐'}
        </Text>
      ))}
    </View>
  );
}

export function Progress({ value, total, color = colors.sea }) {
  return (
    <View style={styles.progress}>
      <View style={{ width: `${(value / total) * 100}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
    </View>
  );
}

// A short wobble for wrong answers.
export function useShake() {
  const x = useRef(new Animated.Value(0)).current;
  const shake = () => {
    x.setValue(0);
    Animated.sequence(
      [10, -10, 8, -8, 0].map((v) => Animated.timing(x, { toValue: v, duration: 60, useNativeDriver: Platform.OS !== 'web' }))
    ).start();
  };
  return [{ transform: [{ translateX: x }] }, shake];
}

export function Pop({ children, style }) {
  const s = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [s]);
  return <Animated.View style={[{ transform: [{ scale: s }] }, style]}>{children}</Animated.View>;
}

// End-of-game card: stars, praise, play again.
export function Finish({ stars, onAgain, onHome }) {
  const { t } = useApp();
  return (
    <View style={styles.finish}>
      <Pop style={styles.finishCard}>
        <T display center style={{ fontSize: 34 }}>
          {stars === 3 ? t('amazing') : t('great')}
        </T>
        <Stars n={stars} size={44} />
        <View style={{ gap: 10, width: '100%' }}>
          <Btn label={t('again')} onPress={onAgain} />
          <Btn label={t('backHome')} onPress={onHome} color={colors.surface} />
        </View>
      </Pop>
    </View>
  );
}

export const starsFor = (mistakes) => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 16, flexGrow: 1 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 16, flexGrow: 1 },
  btn: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(27,42,74,0.25)',
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 16 },
  topBar: { alignItems: 'center' },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { height: 10, borderRadius: 999, backgroundColor: colors.line, overflow: 'hidden' },
  finish: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,42,74,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  finishCard: {
    backgroundColor: colors.bg,
    borderRadius: 28,
    padding: 28,
    gap: 18,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
});
