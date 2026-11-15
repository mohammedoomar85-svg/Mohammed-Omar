import { StyleSheet, View } from 'react-native';
import { Screen, T, TopBar, useApp, useDir } from '../ui';
import { colors, games } from '../theme';

// Older games kept their original stamp names.
const LABELS = { shapes: 'stampShapes', build: 'stampBuild', letters: 'stampLetters', count: 'stampCount', words: 'stampWords' };
const STAMPS = [
  { id: 'box1', icon: '📦', label: 'stampBox1', color: colors.sun, hint: 'enterCode' },
  ...games.map((g) => ({ id: g.id, icon: g.icon, label: LABELS[g.id] || `stamp_${g.id}`, color: g.color })),
];

export default function Passport() {
  const { state, t, go } = useApp();
  const { row } = useDir();
  return (
    <Screen>
      <TopBar title={t('passport')} onBack={() => go('home')} />
      <T style={{ color: colors.muted }}>{t('passportSub')}</T>
      <View style={styles.book}>
        <View style={{ flexDirection: row, flexWrap: 'wrap', gap: 12 }}>
          {STAMPS.map((s, i) => {
            const has = state.stamps.includes(s.id);
            return (
              <View
                key={s.id}
                style={[
                  styles.stamp,
                  has
                    ? { borderColor: s.color, transform: [{ rotate: i % 2 ? '4deg' : '-5deg' }] }
                    : { borderColor: colors.line, opacity: 0.55 },
                ]}
              >
                <T style={{ fontSize: 40, opacity: has ? 1 : 0.3 }}>{s.icon}</T>
                <T display center style={{ fontSize: 15, color: has ? colors.ink : colors.muted }}>
                  {t(s.label)}
                </T>
                {!has && (
                  <T center style={{ fontSize: 12, color: colors.muted }}>
                    {t(s.hint || 'stampHint')}
                  </T>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  book: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.line,
    padding: 16,
  },
  stamp: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 140,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 4,
  },
});
