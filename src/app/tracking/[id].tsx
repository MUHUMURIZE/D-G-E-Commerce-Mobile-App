import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
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

  useEffect(() => {
    if (existing) return;
    let active = true;
    orderService.getById(id).then((order) => {
      if (active) setResult({ id, order });
    }).catch((requestError: unknown) => {
      if (active) {
        setResult({
          id,
          error: requestError instanceof Error ? requestError.message : 'Tracking information could not be loaded.',
        });
      }
    });
    return () => { active = false; };
  }, [existing, id]);

  const order = existing ?? (result?.id === id ? result.order : undefined);
  const error = result?.id === id ? result.error : undefined;
  const loading = !existing && result?.id !== id;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{t('orderTracking')}</Text>
      <Text style={styles.title}>{t('trackYourOrder')}</Text>
      <Text style={styles.order}>{t('orderId', { id: id?.slice(-8).toUpperCase() })}</Text>
      {order ? (
        <OrderTimeline status={order.status} />
      ) : loading ? (
        <ActivityIndicator style={styles.loading} color={palette.gold} />
      ) : (
        <Message error>{error ?? 'Tracking information could not be loaded.'}</Message>
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
