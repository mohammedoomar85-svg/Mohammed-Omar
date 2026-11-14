import { useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { Btn, Pop, Screen, T, TopBar, useApp, useShake } from '../ui';
import { colors, fonts } from '../theme';
import { isValidCode } from '../store';
import { online, redeemCode } from '../supabase';

export default function BoxCode() {
  const { state, update, t, go } = useApp();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(state.boxUnlocked);
  const [busy, setBusy] = useState(false);
  const [shakeStyle, shake] = useShake();

  const submit = async () => {
    if (busy) return;
    let result = 'invalid';
    if (online) {
      setBusy(true);
      result = await redeemCode(code);
      setBusy(false);
      // No connection (or a preview that blocks it): still accept the demo code on the device.
      if (result === 'offline' && isValidCode(code)) result = 'ok';
    } else if (isValidCode(code)) {
      result = 'ok';
    }
    if (result !== 'ok') {
      setErr(t(result === 'used' ? 'codeUsed' : result === 'offline' ? 'codeOffline' : 'codeBad'));
      shake();
      return;
    }
    update((s) => ({ ...s, boxUnlocked: true, stamps: s.stamps.includes('box1') ? s.stamps : ['box1', ...s.stamps] }));
    setDone(true);
  };

  return (
    <Screen>
      <TopBar title={t('codeTitle')} onBack={() => go('home')} />
      {done ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <Pop style={styles.stamp}>
            <T style={{ fontSize: 56 }}>📦</T>
            <T display center style={{ fontSize: 20, color: colors.leaf }}>{t('stampBox1')}</T>
          </Pop>
          <T display center style={{ fontSize: 24 }}>{t('codeOk')}</T>
          <Btn label={t('backHome')} onPress={() => go('home')} style={{ alignSelf: 'stretch' }} />
        </View>
      ) : (
        <>
          <T style={{ color: colors.muted }}>{t('codeSub')}</T>
          <Animated.View style={shakeStyle}>
            <TextInput
              value={code}
              onChangeText={(v) => {
                setCode(v.toUpperCase());
                setErr('');
              }}
              placeholder={t('codePh')}
              placeholderTextColor={colors.line}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
              onSubmitEditing={submit}
              maxLength={12}
            />
          </Animated.View>
          {!!err && <T style={{ color: colors.coral }}>{err}</T>}
          <Btn label={t('codeBtn')} onPress={submit} disabled={busy} />
          {(!online || __DEV__) && (
            <View style={styles.demo}>
              <T center style={{ color: colors.muted, fontSize: 15 }}>{t('codeDemo')}</T>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: 4,
    textAlign: 'center',
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.sun,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 18,
  },
  demo: { backgroundColor: colors.band, borderRadius: 14, padding: 12 },
  stamp: {
    borderWidth: 4,
    borderColor: colors.leaf,
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
  },
});
