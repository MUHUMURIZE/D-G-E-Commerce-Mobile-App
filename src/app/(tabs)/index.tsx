import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, FlatList, ImageBackground, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppInput } from '@/components/ui/app-input';
import { EmptyState, Message } from '@/components/ui/message';
import { ProductGridSkeleton } from '@/components/ui/loading-skeleton';
import { ProductCard } from '@/components/product-card';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshProducts, setFilters } from '@/redux/slices/productSlice';
import { fetchOrders } from '@/redux/slices/orderSlice';
import { selectCartCount } from '@/redux/slices/cartSlice';
import { formatRwf } from '@/utils/formatCurrency';
import type { Order } from '@/types';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items, loading, error, filters } = useAppSelector((state) => state.products);
  const { session } = useAppSelector((state) => state.auth);
  const { items: orders, loading: ordersLoading, error: ordersError } = useAppSelector((state) => state.orders);
  const cartCount = useAppSelector((state) => selectCartCount(state.cart.items));
  const [search, setSearch] = useState(filters.search ?? '');

  useEffect(() => {
    void dispatch(refreshProducts({}));
    void dispatch(fetchOrders());
  }, [dispatch]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((product) =>
      (!query || `${product.name} ${product.category}`.toLowerCase().includes(query))
      && (!filters.category || product.category === filters.category)
      && (filters.minPrice === undefined || product.price >= filters.minPrice)
      && (filters.maxPrice === undefined || product.price <= filters.maxPrice));
  }, [filters.category, filters.maxPrice, filters.minPrice, items, search]);

  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];
  const newArrivals = [...items].sort((left, right) =>
    new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime());
  const recentOrders = [...orders].sort((left, right) =>
    new Date(right.created_at).getTime() - new Date(left.created_at).getTime()).slice(0, 2);
  const pendingCount = orders.filter((order) => order.status === 'Pending').length;
  const deliveredCount = orders.filter((order) => order.status === 'Delivered').length;

  const refresh = () => {
    void dispatch(refreshProducts({}));
    void dispatch(fetchOrders());
  };

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={visibleProducts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <ProductCard product={item} />}
      ListHeaderComponent={
        <View>
          <View style={styles.topline}>
            <Text style={styles.brand}>{t('brand')}</Text>
            <Text style={styles.location}>{t('kigaliRwanda')}</Text>
          </View>
          <View style={styles.activity}>
            <Text style={styles.welcome}>{t('welcomeUser', { name: session?.user.name ?? '' })}</Text>
            <Text style={styles.activityCaption}>{t('orderSummary')}</Text>
            <View style={styles.statRow}>
              <ActivityStat label={t('pendingOrders')} value={pendingCount} tone="pending" />
              <ActivityStat label={t('deliveredOrders')} value={deliveredCount} tone="delivered" />
              <ActivityStat label={t('totalOrders')} value={orders.length} tone="total" />
            </View>
            <Text style={styles.quickActionsHeading}>{t('quickActions')}</Text>
            <View style={styles.quickActions}>
              <QuickAction icon="🛍️" label={t('browseProducts')} onPress={() => router.push('/(tabs)/categories')} />
              <QuickAction icon="🛒" label={t('viewCartCount', { count: cartCount })} onPress={() => router.push('/(tabs)/cart')} />
              <QuickAction icon="📦" label={t('viewOrders')} onPress={() => router.push('/(tabs)/orders')} />
            </View>
            {ordersLoading && !orders.length ? <ActivityIndicator style={styles.ordersLoading} color={palette.gold} /> : null}
            {ordersError ? <Message error>{ordersError}</Message> : null}
            {!ordersLoading && !orders.length && !ordersError ? (
              <Text style={styles.noRecentOrders}>{t('noOrdersBody')}</Text>
            ) : null}
            {recentOrders.map((order) => (
              <RecentOrder key={order.id} order={order} onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })} />
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/orders')}
              style={styles.viewOrders}>
              <Text style={styles.viewOrdersText}>{t('viewAllOrders')}  ›</Text>
            </Pressable>
          </View>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200' }}
            style={styles.hero}
            imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <Text style={styles.heroEyebrow}>{t('featuredSubtitle')}</Text>
            <Text style={styles.heroTitle}>{t('featured')}</Text>
            <Text style={styles.heroCaption}>{t('shopNow')}</Text>
          </ImageBackground>
          <View style={styles.search}>
            <AppInput
              label={t('search')}
              placeholder={t('search')}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((category) => {
              const selected = category === 'All' ? !filters.category : category === filters.category;
              return (
                <Text
                  key={category}
                  onPress={() => dispatch(setFilters({ ...filters, category: category === 'All' ? undefined : category }))}
                  style={[styles.chip, selected && styles.selectedChip]}>
                  {category === 'All' ? t('all') : t(category)}
                </Text>
              );
            })}
          </ScrollView>
          {error ? <Message error>{t('loadProductsError')}</Message> : null}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('allProducts')}</Text>
            <Text style={styles.count}>{t('productsCount', { count: visibleProducts.length }).toUpperCase()}</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        loading
          ? <ProductGridSkeleton />
          : error
            ? <EmptyState title={t('errorTitle')} body={t('loadProductsError')} />
            : <Text style={styles.empty}>{t('noMatchingProducts')}</Text>
      }
      ListFooterComponent={
        items.length ? (
          <View style={styles.newArrivals}>
            <Text style={styles.sectionTitle}>{t('newArrivals')}</Text>
            <Text style={styles.newArrivalSubtitle}>{t('newArrivalsSubtitle')}</Text>
            {[0, 1].map((row) => (
              <View key={row} style={styles.newArrivalRow}>
                {newArrivals.slice(row * 2, row * 2 + 2).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </View>
            ))}
          </View>
        ) : undefined
      }
      refreshControl={
        <RefreshControl
          refreshing={loading || ordersLoading}
          onRefresh={refresh}
          tintColor={palette.gold}
        />
      }
    />
  );
}

function ActivityStat({ label, value, tone }: { label: string; value: number; tone: 'pending' | 'delivered' | 'total' }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, tone === 'pending' && styles.pendingValue, tone === 'delivered' && styles.deliveredValue]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.quickAction}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text numberOfLines={2} style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function RecentOrder({ order, onPress }: { order: Order; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.orderCard}>
      <View style={styles.orderHead}>
        <Text style={styles.orderId}>{t('orderId', { id: order.id.slice(-8).toUpperCase() })}</Text>
        <Text style={[styles.orderStatus, order.status === 'Delivered' ? styles.deliveredValue : styles.pendingValue]}>
          {t(order.status.toLowerCase())}
        </Text>
      </View>
      <Text style={styles.orderMeta}>
        {new Date(order.created_at).toLocaleDateString()}  ·  {formatRwf(order.totalAmount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  topline: { height: 62, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 24, letterSpacing: 6, color: palette.ink, fontWeight: '500' },
  location: { fontSize: 9, letterSpacing: 1.5, color: palette.muted },
  activity: { padding: 16, marginBottom: 18, borderRadius: 18, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, shadowColor: palette.shadow, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  welcome: { color: palette.ink, fontSize: 20, fontWeight: '800' },
  activityCaption: { marginTop: 4, color: palette.muted, fontSize: 12 },
  statRow: { flexDirection: 'row', gap: 9, marginTop: 16, marginBottom: 12 },
  stat: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 11, paddingHorizontal: 4, borderRadius: 12, backgroundColor: palette.paper },
  statValue: { color: palette.ink, fontSize: 19, fontWeight: '800' },
  statLabel: { marginTop: 4, color: palette.muted, fontSize: 9, textAlign: 'center' },
  quickActionsHeading: { marginBottom: 8, color: palette.ink, fontSize: 12, fontWeight: '700' },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  quickAction: { flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 5, paddingVertical: 8, borderRadius: 11, backgroundColor: palette.goldLight },
  quickActionIcon: { fontSize: 19 },
  quickActionText: { color: palette.gold, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  pendingValue: { color: palette.warning },
  deliveredValue: { color: palette.success },
  ordersLoading: { marginVertical: 10 },
  noRecentOrders: { paddingVertical: 10, color: palette.muted, fontSize: 12 },
  orderCard: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: palette.line },
  orderHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  orderId: { flex: 1, color: palette.ink, fontSize: 11, fontWeight: '700' },
  orderStatus: { fontSize: 11, fontWeight: '700' },
  orderMeta: { marginTop: 5, color: palette.muted, fontSize: 11 },
  viewOrders: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 5 },
  viewOrdersText: { color: palette.gold, fontSize: 12, fontWeight: '700' },
  hero: { height: 240, justifyContent: 'flex-end', padding: 24, marginBottom: 18, borderRadius: 22, overflow: 'hidden', backgroundColor: '#334155' },
  heroImage: { borderRadius: 22 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.28)' },
  heroEyebrow: { fontSize: 10, letterSpacing: 2, color: palette.white, marginBottom: 8 },
  heroTitle: { fontSize: 27, fontWeight: '600', color: palette.white, marginBottom: 12 },
  heroCaption: { fontSize: 11, letterSpacing: 1.5, color: palette.white },
  search: { marginBottom: 12 },
  chips: { gap: 8, paddingVertical: 6 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, overflow: 'hidden', color: palette.ink, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, fontSize: 12, fontWeight: '600' },
  selectedChip: { color: palette.white, backgroundColor: palette.gold, borderColor: palette.gold },
  sectionHeader: { marginTop: 22, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, color: palette.ink, fontWeight: '600' },
  count: { color: palette.muted, fontSize: 9, letterSpacing: 1.2 },
  row: { gap: 14 },
  empty: { padding: 30, textAlign: 'center', color: palette.muted },
  newArrivals: { marginTop: 30 },
  newArrivalSubtitle: { color: palette.muted, fontSize: 13, marginTop: 5, marginBottom: 14 },
  newArrivalRow: { flexDirection: 'row', gap: 14 },
});
