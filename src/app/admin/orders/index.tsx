import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type AdminOrder } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppInput } from '@/components/ui/app-input';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';

export default function AdminOrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await adminService.orders());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const filtered = useMemo(() => orders.filter((order) =>
    `${order.id} ${order.User?.fullName ?? ''} ${order.status}`.toLowerCase().includes(search.trim().toLowerCase())),
  [orders, search]);

  return (
    <FlatList
      style={adminStyles.screen}
      contentContainerStyle={adminStyles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void load(); }} tintColor={palette.gold} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <AdminHeader title={t('customerOrders')} />
          {error ? <Message error>{error}</Message> : null}
          <AppInput label={t('searchOrders')} value={search} onChangeText={setSearch} />
        </View>
      }
      ListEmptyComponent={
        loading
          ? <ActivityIndicator style={styles.loading} color={palette.gold} />
          : <EmptyState
            title={error ? t('errorTitle') : t('noAdminOrders')}
            body={error ?? t('refreshError')}
          />
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push({ pathname: '/admin/orders/[id]', params: { id: item.id } })} style={adminStyles.card}>
          <View style={adminStyles.row}>
            <Text style={styles.orderId}>{t('orderId', { id: item.id.slice(-8).toUpperCase() })}</Text>
            <Text style={styles.status}>{t(item.status.toLowerCase())}</Text>
          </View>
          <Text style={styles.customer}>{item.User?.fullName ?? item.userId}</Text>
          <Text style={adminStyles.muted}>{formatRwf(item.totalAmount)} · {item.items.length} {t('items').toLowerCase()}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { gap: 12 },
  loading: { marginTop: 24 },
  orderId: { color: palette.ink, fontWeight: '700', fontSize: 14 },
  status: { color: palette.gold, fontSize: 12, fontWeight: '700' },
  customer: { color: palette.muted, fontSize: 13, marginTop: 8 },
});
