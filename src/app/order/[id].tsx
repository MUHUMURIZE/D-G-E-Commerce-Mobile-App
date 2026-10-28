import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { orderService } from '@/api/orderService';
import { productService } from '@/api/productService';
import { AuthGate } from '@/components/auth-gate';
import { OrderTimeline } from '@/components/order-timeline';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { formatOrderDate } from '@/utils/formatDate';
import { useAppSelector } from '@/redux/hooks';
import { resolveImageUrl } from '@/utils/imageUrl';
import { navigateBack } from '@/utils/navigation';
import type { Order, OrderLine, Product } from '@/types';

function OrderDetailContent() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useAppSelector((state) => state.orders.items.find((order) => order.id === id));
  const catalog = useAppSelector((state) => state.products.items);
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

  if (loading || error || !order) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.unavailable}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { void loadOrder(); }}
            tintColor={palette.gold}
          />
        }>
        {loading ? <ActivityIndicator color={palette.gold} /> : null}
        {error ? <Message error>{error}</Message> : null}
        {!loading && !error ? <Message error>{t('orderNotFound')}</Message> : null}
      </ScrollView>
    );
  }

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
      <Text onPress={() => navigateBack('/(tabs)/orders')} style={styles.back}>‹  {t('back')}</Text>
      <Text style={styles.eyebrow}>{t('orderId', { id: order.id.slice(-8).toUpperCase() })}</Text>
      <Text style={styles.title}>{t('orderDetails')}</Text>
      <Text style={styles.date}>{t('placedOn', { date: formatOrderDate(order.created_at, i18n.resolvedLanguage ?? i18n.language) })}</Text>
      <OrderTimeline status={order.status} />
      <Text style={styles.heading}>{t('orderItems').toUpperCase()}</Text>
      {order.items.map((item) => (
        <OrderLineCard
          key={item.id}
          item={item}
          cachedProduct={catalog.find((product) => product.id === item.productId)}
        />
      ))}
      <Text style={styles.total}>{t('total')}  {formatRwf(order.totalAmount)}</Text>
      <Text style={styles.heading}>{t('deliveryDetails').toUpperCase()}</Text>
      <Text style={styles.address}>{order.shippingAddress.fullName}{'\n'}{order.shippingAddress.phone}{'\n'}{order.shippingAddress.district}, {order.shippingAddress.province}{'\n'}{order.shippingAddress.street}</Text>
      <Text onPress={() => router.push({ pathname: '/tracking/[id]', params: { id: order.id } })} style={styles.track}>{t('trackOrder')}  ›</Text>
    </ScrollView>
  );
}

function OrderLineCard({ item, cachedProduct }: { item: OrderLine; cachedProduct?: Product }) {
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedProduct) return;
    let active = true;
    void Promise.resolve()
      .then(() => productService.getById(item.productId))
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setLookupError(requestError instanceof Error ? requestError.message : t('loadError'));
        }
      });
    return () => { active = false; };
  }, [cachedProduct, item.productId, t]);

  const details = cachedProduct ?? product;
  const imageUrl = resolveImageUrl(details?.imageUrl);

  return (
    <View style={styles.itemCard}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.itemImage} contentFit="cover" cachePolicy="memory-disk" />
      ) : (
        <View style={styles.itemImagePlaceholder} />
      )}
      <View style={styles.itemDetails}>
        <Text numberOfLines={2} style={styles.itemName}>
          {details?.name ?? t('productId', { id: item.productId.slice(-8).toUpperCase() })}
        </Text>
        <Text style={styles.itemMeta}>
          {t('quantity')}: {item.quantity} · {formatRwf(item.unitPrice)} {t('each')}
        </Text>
        {lookupError ? (
          <Text style={styles.lookupError}>
            {t('orderProductLookupError', { error: lookupError })}
          </Text>
        ) : null}
      </View>
      <Text style={styles.itemTotal}>{formatRwf(item.unitPrice * item.quantity)}</Text>
    </View>
  );
}

export default function OrderDetailScreen() {
  return <AuthGate><OrderDetailContent /></AuthGate>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  unavailable: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  back: { marginVertical: 10, color: palette.muted, fontSize: 10, letterSpacing: 1 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginTop: 8, color: palette.ink, fontSize: 27, fontWeight: '600' },
  date: { marginTop: 5, color: palette.muted, fontSize: 12 },
  heading: { color: palette.muted, fontSize: 10, letterSpacing: 1.4, marginTop: 22, marginBottom: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginBottom: 10, borderRadius: 14, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  itemImage: { width: 58, height: 66, borderRadius: 9, backgroundColor: palette.goldLight },
  itemImagePlaceholder: { width: 58, height: 66, borderRadius: 9, backgroundColor: palette.goldLight },
  itemDetails: { flex: 1, gap: 4 },
  itemName: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  itemMeta: { color: palette.muted, fontSize: 11 },
  itemTotal: { color: palette.ink, fontSize: 12, fontWeight: '700' },
  lookupError: { color: palette.danger, fontSize: 11 },
  total: { color: palette.ink, fontWeight: '700', marginTop: 14, fontSize: 15 },
  address: { color: palette.ink, lineHeight: 22, fontSize: 13 },
  track: { color: palette.gold, marginTop: 24, textDecorationLine: 'underline' },
});
