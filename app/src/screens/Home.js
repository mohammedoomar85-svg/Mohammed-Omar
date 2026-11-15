import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Screen, Stars, T, useApp, useDir } from '../ui';
import { colors, games, sections } from '../theme';
import { num } from '../i18n';

// On the website every game is open as a free trial.
const TRIAL = Platform.OS === 'web';

// The trial runs inside the website, so the sign-up form is on the same site.
function openSignup() {
  if (typeof window !== 'undefined' && window.location) window.location.href = '/#signup';
}

export default function Home() {
  const { state, t, go, lang } = useApp();
  const { row } = useDir();
  const unlocked = state.boxUnlocked;

  return (
    <Screen>
      <View style={{ flexDirection: row, alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <T display style={{ fontSize: 30 }}>
            {t('hello')} {state.child.name} 👋
          </T>
          <T style={{ color: colors.muted }}>{t('homeSub')}</T>
        </View>
        <Pressable accessibilityRole="button" onPress={() => go('parents')} style={styles.parentBtn}>
          <T bold style={{ fontSize: 14 }}>{t('parents')}</T>
        </Pressable>
      </View>

      {TRIAL && !unlocked && (
        <View style={[styles.trial, { flexDirection: row }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <T display style={{ fontSize: 18, color: '#fff' }}>{t('trialTitle')}</T>
            <T style={{ color: '#E6F6F8', fontSize: 14 }}>{t('trialSub')}</T>
          </View>
          <Pressable accessibilityRole="link" onPress={openSignup} style={styles.trialBtn}>
            <T display style={{ fontSize: 15 }}>{t('trialCta')}</T>
          </Pressable>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => go(unlocked ? 'passport' : 'code')}
        style={[styles.box, unlocked && { backgroundColor: colors.seaSoft, borderColor: colors.sea }]}
      >
        <View style={{ flexDirection: row, alignItems: 'center', gap: 14 }}>
          <T style={{ fontSize: 40 }}>{unlocked ? '📦' : '🎁'}</T>
          <View style={{ flex: 1, gap: 2 }}>
            <T display style={{ fontSize: 20 }}>{t('box1')}</T>
            <T style={{ color: colors.muted, fontSize: 15 }}>{unlocked ? t('boxOpen') : t('boxLocked')}</T>
          </View>
        </View>
        {!unlocked && (
          <View style={styles.codeChip}>
            <T display center style={{ fontSize: 17 }}>{t('enterCode')}</T>
          </View>
        )}
      </Pressable>

      {sections.map((sec) => {
        const list = games.filter((g) => g.section === sec.id);
        return (
          <View key={sec.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: row, alignItems: 'center', gap: 8 }}>
              <View style={[styles.secIcon, { backgroundColor: sec.color }]}>
                <T style={{ fontSize: 18 }}>{sec.icon}</T>
              </View>
              <T display style={{ fontSize: 22, flex: 1 }}>{t(`sec_${sec.id}`)}</T>
              <T style={{ color: colors.muted, fontSize: 14 }}>{num(list.length, lang)}</T>
            </View>
            <View style={{ flexDirection: row, flexWrap: 'wrap', gap: 10 }}>
              {list.map((g) => {
                const open = g.free || unlocked || TRIAL;
                const best = state.stats[g.id]?.best || 0;
                return (
                  <Pressable
                    key={g.id}
                    accessibilityRole="button"
                    accessibilityLabel={t(`g_${g.id}`)}
                    onPress={() => go(open ? g.id : 'code')}
                    style={({ pressed }) => [
                      styles.game,
                      { borderColor: g.color, opacity: open ? 1 : 0.6, transform: [{ scale: pressed ? 0.97 : 1 }] },
                    ]}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: g.color }]}>
                      <T style={{ fontSize: 28 }}>{open ? g.icon : '🔒'}</T>
                    </View>
                    <T display center style={{ fontSize: 17 }} numberOfLines={1}>{t(`g_${g.id}`)}</T>
                    <T center style={{ color: colors.muted, fontSize: 12 }} numberOfLines={2}>
                      {t(`g_${g.id}_d`)}
                    </T>
                    {best > 0 && <Stars n={best} size={14} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      <Pressable accessibilityRole="button" onPress={() => go('passport')} style={[styles.passport, { flexDirection: row }]}>
        <T style={{ fontSize: 28 }}>📘</T>
        <T display style={{ fontSize: 20, flex: 1 }}>{t('passport')}</T>
        <T display style={{ fontSize: 20, color: colors.sea }}>
          {num(state.stamps.length, lang)} {t('of')} {num(games.length + 1, lang)}
        </T>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  trial: { backgroundColor: colors.sea, borderRadius: 20, padding: 14, alignItems: 'center', gap: 12 },
  trialBtn: { backgroundColor: colors.sun, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  parentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  box: {
    backgroundColor: colors.band,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.sun,
    borderStyle: 'dashed',
    padding: 18,
    gap: 14,
  },
  codeChip: { backgroundColor: colors.sun, borderRadius: 999, paddingVertical: 10 },
  game: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  iconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  secIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  passport: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 16,
  },
});
