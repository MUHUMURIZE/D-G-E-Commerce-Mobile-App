import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type AdminUser } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { Message } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';
import { useAppSelector } from '@/redux/hooks';

export default function AdminUserDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { notify } = useNotifications();
  const currentUserId = useAppSelector((state) => state.auth.session?.user.id);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await adminService.user(id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const changeRole = async (role: 'customer' | 'admin') => {
    if (!user || role === user.role) return;
    setSaving(true);
    try {
      setUser(await adminService.updateUserRole(user.id, role));
      notify(t('roleUpdated'));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('unknownError');
      setError(message);
      notify(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = () => {
    if (!user) return;
    Alert.alert(t('deleteUser'), t('deleteUserConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          void adminService.deleteUser(user.id).then(() => {
            notify(t('userDeleted'));
            router.replace('/admin/users');
          }).catch((reason: unknown) => {
            const message = reason instanceof Error ? reason.message : t('deleteFailed');
            setError(message);
            notify(message, 'error');
          });
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={adminStyles.screen}
      contentContainerStyle={adminStyles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => { void load(); }}
          tintColor={palette.gold}
        />
      }>
      <AdminHeader title={t('userDetails')} />
      {error ? <Message error>{error}</Message> : null}
      {loading && !user ? <ActivityIndicator color={palette.gold} /> : null}
      {user ? (
        <>
          <View style={adminStyles.card}>
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={adminStyles.muted}>{user.email}</Text>
            {user.phone ? <Text style={adminStyles.muted}>{user.phone}</Text> : null}
            <View style={adminStyles.divider} />
            <Text style={styles.label}>{t('role')}</Text>
            <Text style={adminStyles.action}>{t(user.role)}</Text>
          </View>
          <Text style={styles.label}>{t('changeRole')}</Text>
          <View style={styles.roles}>
            {(['customer', 'admin'] as const).map((role) => (
              <Pressable
                key={role}
                onPress={() => { void changeRole(role); }}
                style={[styles.role, role === user.role && styles.selectedRole]}>
                <Text style={[styles.roleText, role === user.role && styles.selectedRoleText]}>{t(role)}</Text>
              </Pressable>
            ))}
          </View>
          {currentUserId !== user.id ? (
            <AppButton title={t('deleteUser')} variant="danger" onPress={deleteUser} loading={saving} />
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { color: palette.ink, fontSize: 22, fontWeight: '800', marginBottom: 5 },
  label: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  roles: { flexDirection: 'row', gap: 12 },
  role: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  selectedRole: { backgroundColor: palette.goldLight, borderColor: palette.gold },
  roleText: { color: palette.ink, fontWeight: '600' },
  selectedRoleText: { color: palette.gold },
});
