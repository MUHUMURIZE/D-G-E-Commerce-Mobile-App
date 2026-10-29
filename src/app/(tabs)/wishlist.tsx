import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useWishlist } from '@/components/wishlist-provider';
import { ProductImage } from '@/components/product-image';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';

export default function WishlistScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const { entries, loading, refresh, remove } = useWishlist();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void refresh(); }} tintColor={palette.gold} />}>
      <Text style={styles.eyebrow}>{t('customerAccount')}</Text>
      <Text style={styles.title}>{t('myWishlist')}</Text>
      {!entries.length && loading ? <ActivityIndicator color={palette.gold} /> : null}
      {!entries.length && !loading ? (
        <EmptyState title={t('wishlistEmpty')} body={t('wishlistEmptyBody')} />
      ) : null}
      {entries.map(({ id, Product: product, productId }) => (
        <View key={id} style={styles.card}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: productId } })}
            style={styles.product}>
            <ProductImage uri={product.imageUrl} style={styles.image} />
            <View style={styles.details}>
              <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
              <Text style={styles.category}>{t(product.category)}</Text>
              <Text style={styles.price}>{formatRwf(product.price)}</Text>
            </View>
          </Pressable>
          <View style={styles.actions}>
            <AppButton
              title={t('addToBag')}
              disabled={product.availabilityStatus === 'Out Of Stock'}
              onPress={() => {
                dispatch(addToCart(product));
                notify(t('addedToCart'));
              }}
            />
            <AppButton title={t('remove')} variant="danger" onPress={() => { void remove(productId); }} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 18, paddingBottom: 36 },
  eyebrow: { color: palette.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  title: { marginTop: 6, marginBottom: 18, color: palette.ink, fontSize: 26, fontWeight: '800' },
  card: { padding: 12, marginBottom: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 16, backgroundColor: palette.white },
  product: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 76, height: 82, borderRadius: 10, backgroundColor: palette.goldLight },
  details: { flex: 1, gap: 4 },
  name: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  category: { color: palette.muted, fontSize: 11 },
  price: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  actions: { gap: 8, marginTop: 12 },
});
