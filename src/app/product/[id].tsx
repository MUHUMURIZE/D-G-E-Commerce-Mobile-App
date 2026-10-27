import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { productService } from '@/api/productService';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';

export default function ProductDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useAppSelector((state) => state.products.items.find((item) => item.id === id));
  const dispatch = useAppDispatch();
  const [result, setResult] = useState<{ id: string; product?: typeof existing; error?: string } | null>(null);

  useEffect(() => {
    if (existing) return;
    let active = true;
    productService.getById(id).then((product) => {
      if (active) setResult({ id, product });
    }).catch((requestError: unknown) => {
      if (active) {
        setResult({
          id,
          error: requestError instanceof Error ? requestError.message : 'Product could not be loaded.',
        });
      }
    });
    return () => { active = false; };
  }, [existing, id]);

  const product = existing ?? (result?.id === id ? result.product : undefined);
  const error = result?.id === id ? result.error : undefined;
  const loading = !existing && result?.id !== id;
  const availability = product?.availabilityStatus === 'Out Of Stock'
    ? t('outOfStock')
    : product?.availabilityStatus.startsWith('Only ')
      ? t('onlyLeft', { count: product.availabilityStatus.match(/\d+/)?.[0] })
      : t('inStock');

  if (loading) return <ActivityIndicator style={styles.loading} color={palette.gold} />;
  if (!product) {
    return error
      ? <Message error>{error}</Message>
      : <EmptyState title={t('productUnavailable')} body={t('productUnavailableBody')} />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.back} onPress={() => router.back()}>‹  {t('back')}</Text>
      <View style={styles.productCard}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        <View style={styles.productInfo}>
          <Text style={styles.category}>{t(product.category).toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatRwf(product.price)}</Text>
          <Text style={styles.rating}>★ {product.rating.toFixed(1)}  ·  {availability}</Text>
          <View style={styles.divider} />
          <Text style={styles.descriptionTitle}>{t('description')}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.shipping}>{t('freeDelivery')}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: 16, paddingBottom: 36 },
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
});
