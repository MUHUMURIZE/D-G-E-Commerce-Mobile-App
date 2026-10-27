import { useEffect } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AuthGate } from '@/components/auth-gate';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchOrders } from '@/redux/slices/orderSlice';

function OrdersContent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => { void dispatch(fetchOrders()); }, [dispatch]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void dispatch(fetchOrders()); }} tintColor={palette.gold} />}>
      <Text style={styles.eyebrow}>{t('account')}</Text>
      <Text style={styles.title}>{t('orderHistory')}</Text>
      {loading && !items.length ? <ActivityIndicator color={palette.gold} /> : null}
      {error ? <Message error>{error}</Message> : null}
      {!loading && !items.length && !error ? (
        <EmptyState title={t('noOrders')} body={t('noOrdersBody')} />
      ) : null}
      {items.map((order) => (
        <Pressable
          key={order.id}
          onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
          style={styles.card}>
          <View style={styles.orderLine}>
            <Text style={styles.orderId}>ORDER {order.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.status}>{t(order.status.toLowerCase()).toUpperCase()}</Text>
          </View>
          <Text style={styles.date}>{new Date(order.created_at).toLocaleDateString()}</Text>
          <Text style={styles.amount}>{formatRwf(order.totalAmount)}</Text>
          <Text style={styles.details}>{t('viewDetails')}  ›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function OrdersScreen() {
  return <AuthGate><OrdersContent /></AuthGate>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginVertical: 12, fontSize: 28, color: palette.ink, fontWeight: '600' },
  card: { padding: 17, marginTop: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 4 },
  orderLine: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontSize: 11, letterSpacing: 1, color: palette.muted },
  status: { fontSize: 10, letterSpacing: 1, color: palette.success },
  date: { marginTop: 12, color: palette.muted, fontSize: 12 },
  amount: { marginTop: 5, color: palette.ink, fontWeight: '600', fontSize: 17 },
  details: { color: palette.gold, marginTop: 12, fontSize: 12 },
});
