import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type AdminOrder } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { Message } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { OrderTimeline } from '@/components/order-timeline';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import type { OrderStatus } from '@/types';

const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Packing', 'Shipped', 'Delivered'];

export default function AdminOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { notify } = useNotifications();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await adminService.order(id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const setStatus = async (status: OrderStatus) => {
    if (!order || status === order.status) return;
    setSaving(true);
    setError(null);
    try {
      setOrder(await adminService.updateOrderStatus(order.id, status));
      notify(t('statusUpdated'));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('unknownError');
      setError(message);
      notify(message, 'error');
    } finally {
      setSaving(false);
    }
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
      <AdminHeader title={t('orderDetails')} />
      {error ? <Message error>{error}</Message> : null}
      {loading && !order ? <ActivityIndicator color={palette.gold} /> : null}
      {order ? (
        <>
          <View style={adminStyles.card}>
            <Text style={styles.customer}>{order.User?.fullName ?? order.userId}</Text>
            <Text style={adminStyles.muted}>{order.User?.email}</Text>
            <Text style={adminStyles.muted}>{formatRwf(order.totalAmount)}</Text>
            <Text style={adminStyles.muted}>{t('payment')}: {t(order.paymentMethod)}</Text>
            <Text style={adminStyles.muted}>{t('shippingAddress')}: {JSON.stringify(order.shippingAddress)}</Text>
          </View>
          <OrderTimeline status={order.status} />
          <Text style={styles.section}>{t('updateStatus')}</Text>
          <View style={styles.statuses}>
            {statuses.map((status) => (
              <Pressable
                key={status}
                onPress={() => { void setStatus(status); }}
                disabled={saving}
                style={[styles.status, status === order.status && styles.selectedStatus]}>
                <Text style={[styles.statusText, status === order.status && styles.selectedText]}>{t(status.toLowerCase())}</Text>
              </Pressable>
            ))}
          </View>
          <AppButton title={t('refresh')} secondary onPress={() => { void load(); }} loading={saving} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  customer: { color: palette.ink, fontSize: 17, fontWeight: '700', marginBottom: 5 },
  section: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  status: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  selectedStatus: { backgroundColor: palette.gold, borderColor: palette.gold },
  statusText: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  selectedText: { color: palette.white },
});
