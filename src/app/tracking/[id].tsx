import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { orderService } from '@/api/orderService';
import { OrderTimeline } from '@/components/order-timeline';
import { AuthGate } from '@/components/auth-gate';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppSelector } from '@/redux/hooks';
import type { Order } from '@/types';

function TrackingContent() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useAppSelector((state) => state.orders.items.find((item) => item.id === id));
  const [result, setResult] = useState<{ id: string; order?: Order; error?: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = useCallback(async () => {
    setRefreshing(true);
    try {
      const order = await orderService.getById(id);
      setResult({ id, order });
    } catch (requestError: unknown) {
      setResult({ id, error: requestError instanceof Error ? requestError.message : t('trackingLoadError') });
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
      <Text style={styles.eyebrow}>{t('orderTracking')}</Text>
      <Text style={styles.title}>{t('trackYourOrder')}</Text>
      <Text style={styles.order}>{t('orderId', { id: id?.slice(-8).toUpperCase() })}</Text>
      {order ? (
        <OrderTimeline status={order.status} />
      ) : loading ? (
        <ActivityIndicator style={styles.loading} color={palette.gold} />
      ) : (
        <Message error>{error ?? t('trackingLoadError')}</Message>
      )}
    </ScrollView>
  );
}

export default function TrackingScreen() {
  return <AuthGate><TrackingContent /></AuthGate>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 22 },
  loading: { marginTop: 28 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginTop: 8, fontSize: 27, color: palette.ink, fontWeight: '600' },
  order: { marginTop: 8, color: palette.muted, fontSize: 11, letterSpacing: 1 },
  note: { marginTop: 25, color: palette.muted, fontSize: 14, lineHeight: 22 },
});
