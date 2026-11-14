import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Btn, Logo, Screen, T, useApp, useDir } from '../ui';
import { colors, fonts } from '../theme';

export default function Welcome() {
  const { state, update, t } = useApp();
  const { row, align, rtl } = useDir();
  const [name, setName] = useState('');
  const [age, setAge] = useState('small');
  const [err, setErr] = useState('');

  if (!state.lang) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: 28 }}>
          <Logo big />
          <View style={{ gap: 4 }}>
            <T display center style={{ fontSize: 26 }}>اختار اللغة</T>
            <T center style={{ color: colors.muted }}>Choose your language</T>
          </View>
          <View style={{ gap: 14 }}>
            {[
              { id: 'ar', label: 'العربية', sub: 'Arabic' },
              { id: 'en', label: 'English', sub: 'الإنجليزية' },
            ].map((l) => (
              <Pressable
                key={l.id}
                accessibilityRole="button"
                onPress={() => update({ lang: l.id })}
                style={({ pressed }) => [styles.langCard, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <T display center style={{ fontSize: 30 }}>{l.label}</T>
                <T center style={{ color: colors.muted }}>{l.sub}</T>
              </Pressable>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  const start = () => {
    if (name.trim().length < 1) return setErr(t('needName'));
    update({ child: { name: name.trim(), age } });
  };

  return (
    <Screen>
      <Logo />
      <T display style={{ fontSize: 30 }}>{t('setupTitle')}</T>

      <View style={{ gap: 8 }}>
        <T bold>{t('childName')}</T>
        <TextInput
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErr('');
          }}
          placeholder={t('childNamePh')}
          placeholderTextColor={colors.muted}
          style={[styles.input, { textAlign: align, writingDirection: rtl ? 'rtl' : 'ltr' }]}
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={start}
        />
        {!!err && <T style={{ color: colors.coral }}>{err}</T>}
      </View>

      <View style={{ gap: 8 }}>
        <T bold>{t('childAge')}</T>
        <View style={{ flexDirection: row, gap: 10 }}>
          {['small', 'big'].map((a) => (
            <Pressable
              key={a}
              accessibilityRole="radio"
              accessibilityState={{ checked: age === a }}
              onPress={() => setAge(a)}
              style={[styles.age, age === a && styles.ageOn]}
            >
              <T display center style={{ fontSize: 30, color: age === a ? colors.sea : colors.ink }}>
                {a === 'small' ? (state.lang === 'ar' ? '٣-٥' : '3-5') : state.lang === 'ar' ? '٦-٨' : '6-8'}
              </T>
              <T center style={{ color: colors.muted, fontSize: 15 }}>
                {t(a === 'small' ? 'ageSmall' : 'ageBig')}
              </T>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }} />
      <Btn label={t('start')} onPress={start} />
      <Pressable onPress={() => update({ lang: null })} style={{ alignSelf: 'center', padding: 8 }}>
        <T style={{ color: colors.muted, textDecorationLine: 'underline' }}>{t('langHint')}</T>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 24,
    paddingVertical: 22,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  age: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 20,
    paddingVertical: 16,
  },
  ageOn: { borderColor: colors.sea, backgroundColor: colors.seaSoft },
});
