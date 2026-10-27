import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { orderService } from '@/api/orderService';
import { AuthGate } from '@/components/auth-gate';
import { OrderTimeline } from '@/components/order-timeline';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppSelector } from '@/redux/hooks';
import type { Order } from '@/types';

function OrderDetailContent() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useAppSelector((state) => state.orders.items.find((order) => order.id === id));
  const [result, setResult] = useState<{ id: string; order?: Order; error?: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = useCallback(async () => {
    setRefreshing(true);
    try {
      const order = await orderService.getById(id);
      setResult({ id, order });
    } catch (requestError: unknown) {
      setResult({ id, error: requestError instanceof Error ? requestError.message : t('loadError') });
    } finally {
      setRefreshing(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (!existing) void Promise.resolve().then(loadOrder);
  }, [existing, loadOrder]);

  const order = existing ?? (result?.id === id ? result.order : undefined);
  const error = result?.id === id ? result.error : undefined;
  const loading = !existing && result?.id !== id;

  if (loading) return <ActivityIndicator style={styles.loading} color={palette.gold} />;
  if (error || !order) return <Message error>{error ?? t('orderNotFound')}</Message>;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { void loadOrder(); }}
          tintColor={palette.gold}
        />
      }>
      <Text onPress={() => router.back()} style={styles.back}>‹  {t('back')}</Text>
      <Text style={styles.eyebrow}>{t('orderId', { id: order.id.slice(-8).toUpperCase() })}</Text>
      <Text style={styles.title}>{t('orderDetails')}</Text>
      <Text style={styles.date}>{t('placedOn', { date: new Date(order.created_at).toLocaleDateString() })}</Text>
      <OrderTimeline status={order.status} />
      <Text style={styles.heading}>{t('orderItems').toUpperCase()}</Text>
      {order.items.map((item) => (
        <Text key={item.id} style={styles.item}>
          {item.quantity} × {item.productId.slice(-8)} · {formatRwf(item.unitPrice * item.quantity)}
        </Text>
      ))}
      <Text style={styles.total}>{t('total')}  {formatRwf(order.totalAmount)}</Text>
      <Text style={styles.heading}>{t('deliveryDetails').toUpperCase()}</Text>
      <Text style={styles.address}>{order.shippingAddress.fullName}{'\n'}{order.shippingAddress.phone}{'\n'}{order.shippingAddress.district}, {order.shippingAddress.province}{'\n'}{order.shippingAddress.street}</Text>
      <Text onPress={() => router.push({ pathname: '/tracking/[id]', params: { id: order.id } })} style={styles.track}>{t('trackOrder')}  ›</Text>
    </ScrollView>
  );
}

export default function OrderDetailScreen() {
  return <AuthGate><OrderDetailContent /></AuthGate>;
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  back: { marginVertical: 10, color: palette.muted, fontSize: 10, letterSpacing: 1 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginTop: 8, color: palette.ink, fontSize: 27, fontWeight: '600' },
  date: { marginTop: 5, color: palette.muted, fontSize: 12 },
  heading: { color: palette.muted, fontSize: 10, letterSpacing: 1.4, marginTop: 22, marginBottom: 10 },
  item: { color: palette.ink, fontSize: 13, lineHeight: 22 },
  total: { color: palette.ink, fontWeight: '700', marginTop: 14, fontSize: 15 },
  address: { color: palette.ink, lineHeight: 22, fontSize: 13 },
  track: { color: palette.gold, marginTop: 24, textDecorationLine: 'underline' },
});
