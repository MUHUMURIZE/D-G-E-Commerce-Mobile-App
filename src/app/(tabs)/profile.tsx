import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { AuthGate } from '@/components/auth-gate';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signOut } from '@/redux/slices/authSlice';
import { authService } from '@/api/authService';
import type { UserProfile } from '@/types';
import { useNotifications } from '@/components/notification-center';

function ProfileContent() {
  const dispatch = useAppDispatch();
  const { session, error: authError } = useAppSelector((state) => state.auth);
  const { t, i18n } = useTranslation();
  const { notify } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState(session?.user.name ?? '');
  const [phone, setPhone] = useState(session?.user.phone ?? '');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.getProfile();
      setProfile(result);
      setName(result.fullName);
      setPhone(result.phone ?? '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void Promise.resolve().then(loadProfile); }, [loadProfile]);

  const changeLanguage = async (language: 'en' | 'rw' | 'fr') => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('@dg/language', language);
    } catch {
      setError(t('languageSaveError'));
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await authService.updateProfile({ fullName: name.trim(), phone: phone.trim() });
      setProfile(updated);
      setEditing(false);
      notify(t('profileSaved'));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('profileSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const language = i18n.language.split('-')[0];
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => { void loadProfile(); }}
          tintColor={palette.gold}
        />
      }>
      <Text style={styles.eyebrow}>{t('account')}</Text>
      <Text style={styles.title}>{t('profile')}</Text>
      {error ? <Message error>{error}</Message> : null}
      {loading && !profile ? <ActivityIndicator color={palette.gold} /> : null}
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.fullName ?? session?.user.name ?? '?').slice(0, 1).toUpperCase()}</Text></View>
        <Text style={styles.name}>{profile?.fullName ?? session?.user.name}</Text>
        <Text style={styles.email}>{session?.user.email}</Text>
        {profile?.phone ? <Text style={styles.email}>{profile.phone}</Text> : null}
        <Text style={styles.role}>{t(session?.user.role ?? 'customer')}</Text>
      </View>
      {editing ? (
        <View style={styles.editForm}>
          <AppInput label={t('fullName')} value={name} onChangeText={setName} />
          <AppInput label={t('phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <AppButton title={t('saveChanges')} onPress={() => { void saveProfile(); }} loading={saving} />
          <AppButton title={t('cancel')} secondary onPress={() => setEditing(false)} />
        </View>
      ) : (
        <AppButton title={t('editProfile')} secondary onPress={() => setEditing(true)} />
      )}
      {session?.user.role === 'admin' ? (
        <AppButton title={t('adminPanel')} onPress={() => router.push('/admin')} />
      ) : null}
      <AppButton title={t('viewNotifications')} secondary onPress={() => router.push('/notifications')} />
      <Text style={styles.label}>{t('language')}</Text>
      <View style={styles.languages}>
        {(['en', 'rw', 'fr'] as const).map((code) => (
          <Pressable
            key={code}
            accessibilityRole="button"
            onPress={() => { void changeLanguage(code); }}
            style={[styles.language, language === code && styles.selected]}>
            <Text style={[styles.languageText, language === code && styles.selectedText]}>
              {t(code === 'en' ? 'english' : code === 'rw' ? 'kinyarwanda' : 'french')}
            </Text>
          </Pressable>
        ))}
      </View>
      {authError ? <Text style={styles.error}>{authError}</Text> : null}
      <AppButton title={t('signOut')} secondary onPress={() => { void dispatch(signOut()); }} />
    </ScrollView>
  );
}

export default function ProfileScreen() {
  return <AuthGate><ProfileContent /></AuthGate>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36, gap: 14 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  title: { marginTop: 2, marginBottom: 5, color: palette.ink, fontSize: 28, fontWeight: '700' },
  card: { alignItems: 'center', padding: 24, gap: 6, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 14 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: palette.goldLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText: { color: palette.gold, fontSize: 24, fontWeight: '600' },
  name: { color: palette.ink, fontSize: 17, fontWeight: '700' },
  email: { color: palette.muted, fontSize: 13 },
  role: { marginTop: 3, color: palette.gold, fontSize: 12, fontWeight: '700' },
  label: { marginTop: 10, marginBottom: 2, color: palette.muted, fontSize: 12, fontWeight: '700' },
  editForm: { gap: 12 },
  languages: { flexDirection: 'row', gap: 10 },
  language: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white, borderRadius: 10 },
  selected: { backgroundColor: palette.ink, borderColor: palette.ink },
  languageText: { color: palette.ink, fontSize: 13 },
  selectedText: { color: palette.white },
  error: { marginTop: 8, color: palette.danger, fontSize: 12 },
});
