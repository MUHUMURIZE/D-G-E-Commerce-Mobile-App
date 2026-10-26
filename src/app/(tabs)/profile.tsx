import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { AuthGate } from '@/components/auth-gate';
import { AppButton } from '@/components/ui/app-button';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signOut } from '@/redux/slices/authSlice';

function ProfileContent() {
  const dispatch = useAppDispatch();
  const { session, error: authError } = useAppSelector((state) => state.auth);
  const { t, i18n } = useTranslation();
  const [languageError, setLanguageError] = useState<string | null>(null);

  const changeLanguage = async (language: 'en' | 'rw') => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('@dg/language', language);
      setLanguageError(null);
    } catch {
      setLanguageError('Language preference could not be saved. Please try again.');
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>D&amp;G · KIGALI</Text>
      <Text style={styles.title}>{t('profile')}</Text>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{session?.user.name.slice(0, 1).toUpperCase()}</Text></View>
        <Text style={styles.name}>{session?.user.name}</Text>
        <Text style={styles.email}>{session?.user.email}</Text>
      </View>
      <Text style={styles.label}>{t('language')}</Text>
      <View style={styles.languages}>
        {(['en', 'rw'] as const).map((code) => (
          <Pressable
            key={code}
            accessibilityRole="button"
            onPress={() => { void changeLanguage(code); }}
            style={[styles.language, i18n.language === code && styles.selected]}>
            <Text style={[styles.languageText, i18n.language === code && styles.selectedText]}>
              {code === 'en' ? t('english') : t('kinyarwanda')}
            </Text>
          </Pressable>
        ))}
      </View>
      {languageError ? <Text style={styles.error}>{languageError}</Text> : null}
      {authError ? <Text style={styles.error}>{authError}</Text> : null}
      <View style={styles.logout}>
        <AppButton title={t('signOut')} secondary onPress={() => { void dispatch(signOut()); }} />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  return <AuthGate redirectTo="/(tabs)/profile"><ProfileContent /></AuthGate>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper, padding: 20 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginTop: 8, marginBottom: 22, color: palette.ink, fontSize: 28, fontWeight: '600' },
  card: { alignItems: 'center', padding: 24, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 4 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: palette.goldLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.gold, fontSize: 24, fontWeight: '600' },
  name: { marginTop: 12, color: palette.ink, fontSize: 17, fontWeight: '600' },
  email: { marginTop: 4, color: palette.muted, fontSize: 13 },
  label: { marginTop: 28, marginBottom: 10, color: palette.muted, fontSize: 11, letterSpacing: 1.2 },
  languages: { flexDirection: 'row', gap: 10 },
  language: { paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white, borderRadius: 4 },
  selected: { backgroundColor: palette.ink, borderColor: palette.ink },
  languageText: { color: palette.ink, fontSize: 13 },
  selectedText: { color: palette.white },
  error: { marginTop: 8, color: palette.danger, fontSize: 12 },
  logout: { marginTop: 'auto', paddingBottom: 20 },
});
