import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Btn, Screen, T, TopBar, useApp, useDir } from '../ui';
import { colors, fonts, games } from '../theme';
import { num } from '../i18n';

function Gate({ onPass }) {
  const { t, go, lang } = useApp();
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6));
  const [b] = useState(() => 4 + Math.floor(Math.random() * 6));
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const check = () => {
    const n = parseInt(val.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)), 10);
    if (n === a * b) onPass();
    else setErr(true);
  };
  return (
    <Screen>
      <TopBar title={t('parents')} onBack={() => go('home')} />
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <T display center style={{ fontSize: 24 }}>{t('gateTitle')}</T>
        <T center style={{ fontSize: 22 }}>
          {t('gateQ')} {num(a, lang)} × {num(b, lang)} ؟
        </T>
        <TextInput
          value={val}
          onChangeText={(v) => {
            setVal(v);
            setErr(false);
          }}
          keyboardType="number-pad"
          style={styles.input}
          maxLength={3}
          onSubmitEditing={check}
        />
        {err && <T center style={{ color: colors.coral }}>{t('gateBad')}</T>}
        <Btn label={t('gateBtn')} onPress={check} />
      </View>
    </Screen>
  );
}

export default function Parents() {
  const { state, update, reset, t, go, lang } = useApp();
  const { row } = useDir();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const skills = useMemo(
    () =>
      games.map((g) => {
        const s = state.stats[g.id] || { plays: 0, stars: 0 };
        return { ...g, plays: s.plays, avg: s.plays ? s.stars / s.plays : 0 };
      }),
    [state.stats]
  );
  const played = skills.filter((s) => s.plays > 0);
  const strongest = played.length ? [...played].sort((a, b) => b.avg - a.avg)[0] : null;
  const weakest =
    played.length > 1 ? [...skills].sort((a, b) => a.avg - b.avg || a.plays - b.plays)[0] : skills.find((s) => !s.plays);

  if (!open) return <Gate onPass={() => setOpen(true)} />;

  const Seg = ({ value, options, onChange }) => (
    <View style={{ flexDirection: row, gap: 8 }}>
      {options.map((o) => (
        <Pressable
          key={o.v}
          onPress={() => onChange(o.v)}
          style={[styles.seg, value === o.v && styles.segOn]}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === o.v }}
        >
          <T bold center style={{ fontSize: 15, color: value === o.v ? colors.sea : colors.ink }}>
            {o.label}
          </T>
        </Pressable>
      ))}
    </View>
  );

  return (
    <Screen>
      <TopBar title={t('parents')} onBack={() => go('home')} />

      <View style={styles.card}>
        <T display style={{ fontSize: 22 }}>
          {t('report')} {state.child.name}
        </T>
        {skills.map((s) => (
          <View key={s.id} style={{ gap: 4 }}>
            <View style={{ flexDirection: row, justifyContent: 'space-between' }}>
              <T bold>{t(`s_${s.id}`)}</T>
              <T style={{ color: colors.muted, fontSize: 14 }}>
                {s.plays ? `${t('played')} ${num(s.plays, lang)} ${t('times')}` : t('noPlays')}
              </T>
            </View>
            <View style={styles.bar}>
              <View
                style={{
                  width: `${(s.avg / 3) * 100}%`,
                  height: '100%',
                  backgroundColor: s.color,
                  borderRadius: 999,
                  alignSelf: row === 'row' ? 'flex-start' : 'flex-end',
                }}
              />
            </View>
          </View>
        ))}
        {(strongest || weakest) && (
          <View style={styles.insight}>
            {strongest && (
              <T>
                <T bold>{t('strongest')}: </T>
                {t(`s_${strongest.id}`)}
              </T>
            )}
            {weakest && (
              <T>
                <T bold>{t('needsWork')}: </T>
                {t(`s_${weakest.id}`)}
              </T>
            )}
            <T style={{ color: colors.muted, fontSize: 15 }}>
              {t('tip')}: {t('tipText')}
            </T>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <T display style={{ fontSize: 22 }}>{t('settings')}</T>
        <T bold>{t('language')}</T>
        <Seg
          value={state.lang}
          options={[
            { v: 'ar', label: 'العربية' },
            { v: 'en', label: 'English' },
          ]}
          onChange={(v) => update({ lang: v })}
        />
        <T bold>{t('age')}</T>
        <Seg
          value={state.child.age}
          options={[
            { v: 'small', label: t('ageSmall') },
            { v: 'big', label: t('ageBig') },
          ]}
          onChange={(v) => update((s) => ({ ...s, child: { ...s.child, age: v } }))}
        />
        <T bold>{t('sound')}</T>
        <Seg
          value={state.sound}
          options={[
            { v: true, label: t('on') },
            { v: false, label: t('off') },
          ]}
          onChange={(v) => update({ sound: v })}
        />
      </View>

      {Platform.OS === 'web' && (
        <Pressable accessibilityRole="link" onPress={() => window.open('/privacy', '_blank')} style={{ alignSelf: 'center', padding: 6 }}>
          <T style={{ color: colors.sea, textDecorationLine: 'underline' }}>{t('privacy')}</T>
        </Pressable>
      )}
      <Btn
        label={confirm ? t('resetConfirm') : t('reset')}
        color={confirm ? colors.coral : colors.surface}
        textColor={confirm ? '#fff' : colors.coral}
        small
        onPress={() => (confirm ? reset() : setConfirm(true))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: fonts.display,
    fontSize: 30,
    textAlign: 'center',
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 12,
    width: 160,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.line,
    padding: 18,
    gap: 12,
  },
  bar: { height: 12, borderRadius: 999, backgroundColor: colors.line, overflow: 'hidden' },
  insight: { backgroundColor: colors.band, borderRadius: 16, padding: 14, gap: 4 },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  segOn: { borderColor: colors.sea, backgroundColor: colors.seaSoft },
});
