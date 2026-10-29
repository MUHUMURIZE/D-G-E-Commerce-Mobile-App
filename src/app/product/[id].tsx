import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { productService } from '@/api/productService';
import { ProductImage } from '@/components/product-image';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { resolveImageUrl } from '@/utils/imageUrl';
import { navigateBack } from '@/utils/navigation';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { useNotifications } from '@/components/notification-center';
import { useWishlist } from '@/components/wishlist-provider';
import { ProductReviewsSection } from '@/components/product-reviews';

export default function ProductDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useAppSelector((state) => state.products.items.find((item) => item.id === id));
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const { productIds, toggle } = useWishlist();
  const user = useAppSelector((state) => state.auth.session?.user);
  const [result, setResult] = useState<{ id: string; product?: typeof existing; error?: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProduct = useCallback(async () => {
    setRefreshing(true);
    try {
      const product = await productService.getById(id);
      setResult({ id, product });
    } catch (requestError: unknown) {
      setResult({
        id,
        error: requestError instanceof Error ? requestError.message : t('loadError'),
      });
    } finally {
      setRefreshing(false);
    }
  }, [id, t]);

  useEffect(() => {
    void Promise.resolve().then(loadProduct);
  }, [loadProduct]);

  useEffect(() => {
    if (!id) return;
    void productService.recordView(id).catch((requestError: unknown) => {
      notify(requestError instanceof Error ? requestError.message : t('loadError'), 'error');
    });
  }, [id, notify, t]);

  const product = result?.id === id ? result.product ?? existing : existing;
  const error = result?.id === id ? result.error : undefined;
  const loading = !existing && result?.id !== id;
  const availability = product?.availabilityStatus === 'Out Of Stock'
    ? t('outOfStock')
    : product?.availabilityStatus.startsWith('Only ')
      ? t('onlyLeft', { count: product.availabilityStatus.match(/\d+/)?.[0] })
      : t('inStock');

  if (!product) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.unavailable}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { void loadProduct(); }}
            tintColor={palette.gold}
          />
        }>
        {loading ? <ActivityIndicator color={palette.gold} /> : null}
        {error ? <Message error>{error}</Message> : null}
        {!loading && !error ? (
          <EmptyState title={t('productUnavailable')} body={t('productUnavailableBody')} />
        ) : null}
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
          onRefresh={() => { void loadProduct(); }}
          tintColor={palette.gold}
        />
      }>
      <Text style={styles.back} onPress={() => navigateBack('/(tabs)')}>‹  {t('back')}</Text>
      {error ? <Message error>{error}</Message> : null}
      <View style={styles.productCard}>
        <ProductImage uri={resolveImageUrl(product.imageUrl)} style={styles.image} />
        <View style={styles.productInfo}>
          <Text style={styles.category}>{t(product.category).toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatRwf(product.price)}</Text>
          <Text style={styles.rating}>
            {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            {' '}{product.rating.toFixed(1)}  ·  {product.reviewCount
              ? t('basedOnReviews', { count: product.reviewCount })
              : t('noReviews')}
            {'  ·  '}{availability}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.descriptionTitle}>{t('description')}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.shipping}>{t('freeDelivery')}</Text>
          {user?.role === 'customer' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => { void toggle(product.id); }}
              style={styles.wishlist}>
              <Text style={styles.wishlistText}>
                {productIds.has(product.id) ? `♥ ${t('removeFromWishlist')}` : `♡ ${t('addToWishlist')}`}
              </Text>
            </Pressable>
          ) : null}
          <AppButton
            title={product.availabilityStatus === 'Out Of Stock' ? t('outOfStock') : t('addToBag')}
            disabled={product.availabilityStatus === 'Out Of Stock'}
            onPress={() => {
              dispatch(addToCart(product));
              router.push('/(tabs)/cart');
            }}
          />
        </View>
      </View>
      <ProductReviewsSection productId={product.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: 16, paddingBottom: 36 },
  unavailable: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  back: { marginVertical: 10, color: palette.muted, fontSize: 10, letterSpacing: 1 },
  productCard: { overflow: 'hidden', borderRadius: 22, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, shadowColor: palette.shadow, shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  image: { width: '100%', aspectRatio: 0.95, backgroundColor: palette.goldLight },
  productInfo: { padding: 20 },
  category: { color: palette.gold, fontSize: 10, letterSpacing: 1.5 },
  name: { marginTop: 8, color: palette.ink, fontSize: 27, fontWeight: '800' },
  price: { marginTop: 10, color: palette.ink, fontSize: 20, fontWeight: '800' },
  rating: { marginTop: 12, color: palette.muted, fontSize: 13 },
  descriptionTitle: { color: palette.ink, fontSize: 15, fontWeight: '700', marginBottom: 7 },
  divider: { height: 1, backgroundColor: palette.line, marginVertical: 20 },
  description: { color: palette.ink, fontSize: 15, lineHeight: 24 },
  shipping: { color: palette.muted, marginTop: 18, marginBottom: 22, fontSize: 12 },
  wishlist: { minHeight: 44, justifyContent: 'center', marginBottom: 10 },
  wishlistText: { color: palette.gold, fontSize: 14, fontWeight: '700' },
});
