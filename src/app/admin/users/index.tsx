import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type AdminUser } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppInput } from '@/components/ui/app-input';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await adminService.users());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const filtered = useMemo(() => users.filter((user) =>
    `${user.fullName} ${user.email}`.toLowerCase().includes(search.trim().toLowerCase())), [search, users]);

  return (
    <FlatList
      style={adminStyles.screen}
      contentContainerStyle={adminStyles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void load(); }} tintColor={palette.gold} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <AdminHeader title={t('users')} />
          {error ? <Message error>{error}</Message> : null}
          <AppInput label={t('searchUsers')} value={search} onChangeText={setSearch} />
        </View>
      }
      ListEmptyComponent={!loading ? <EmptyState title={t('noUsers')} body={t('refreshError')} /> : undefined}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push({ pathname: '/admin/users/[id]', params: { id: item.id } })} style={adminStyles.card}>
          <View style={adminStyles.row}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.fullName.slice(0, 1).toUpperCase()}</Text></View>
            <View style={styles.details}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={adminStyles.muted}>{item.email}</Text>
            </View>
            <Text style={adminStyles.badge}>{t(item.role)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.goldLight },
  avatarText: { color: palette.gold, fontWeight: '800', fontSize: 18 },
  details: { flex: 1, gap: 3 },
  name: { color: palette.ink, fontSize: 15, fontWeight: '700' },
});
