import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ProductImage } from '@/components/product-image';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { resolveImageUrl } from '@/utils/imageUrl';
import { getAvailableQuantity } from '@/utils/inventory';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addProductQuantity } from '@/redux/slices/cartSlice';
import type { Product } from '@/types';

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const [quantity, setQuantity] = useState(1);
  const cartQuantity = useAppSelector((state) =>
    state.cart.items.find((item) => item.product.id === product.id)?.quantity ?? 0);
  const availableQuantity = getAvailableQuantity(product.availabilityStatus);
  const remainingQuantity = availableQuantity === undefined
    ? 99
    : Math.max(0, availableQuantity - cartQuantity);
  const soldOut = product.availabilityStatus === 'Out Of Stock' || remainingQuantity === 0;
  const selectedQuantity = Math.min(quantity, Math.max(1, remainingQuantity));
  const availability = product.availabilityStatus === 'Out Of Stock'
    ? t('outOfStock')
    : product.availabilityStatus.startsWith('Only ')
      ? t('onlyLeft', { count: product.availabilityStatus.match(/\d+/)?.[0] })
      : t('inStock');
  const openProduct = useCallback(() => {
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  }, [product.id]);
  const decreaseQuantity = useCallback(() => {
    setQuantity((current) => Math.max(1, current - 1));
  }, []);
  const increaseQuantity = useCallback(() => {
    setQuantity((current) => Math.min(current + 1, remainingQuantity));
  }, [remainingQuantity]);
  const addToBag = useCallback(() => {
    dispatch(addProductQuantity({ product, quantity: selectedQuantity }));
    notify(t('addedToCart'));
  }, [dispatch, notify, product, selectedQuantity, t]);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${product.price} Rwandan francs`}
        onPress={openProduct}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <View style={styles.imageWrap}>
          <ProductImage uri={resolveImageUrl(product.imageUrl)} style={styles.image} />
          {soldOut ? (
            <View style={styles.outBadge}><Text style={styles.outBadgeText}>{t('outOfStock')}</Text></View>
          ) : null}
        </View>
        <View style={styles.details}>
          <Text style={styles.category}>{t(product.category).toUpperCase()}</Text>
          <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatRwf(product.price)}</Text>
          <Text style={[styles.availability, soldOut && styles.outOfStock]}>{availability}</Text>
        </View>
      </Pressable>
      {!soldOut ? (
        <View style={styles.addControls}>
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('decreaseQuantity')}
              onPress={decreaseQuantity}
              style={styles.stepButton}>
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Text accessibilityLabel={t('quantity')} style={styles.selectedQuantity}>{selectedQuantity}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('increaseQuantity')}
              accessibilityState={{ disabled: selectedQuantity >= remainingQuantity }}
              disabled={selectedQuantity >= remainingQuantity}
              onPress={increaseQuantity}
              style={[styles.stepButton, selectedQuantity >= remainingQuantity && styles.disabledStep]}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('addToBag')}
            onPress={addToBag}
            style={styles.addButton}>
            <Text style={styles.addButtonText}>{t('addToBag')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, marginBottom: 18, minWidth: 0, padding: 8, borderRadius: 18, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, shadowColor: palette.shadow, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  imageWrap: { overflow: 'hidden', borderRadius: 13, backgroundColor: palette.goldLight },
  image: { width: '100%', aspectRatio: 0.82, backgroundColor: palette.goldLight },
  outBadge: { position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: palette.white },
  outBadgeText: { color: palette.danger, fontSize: 9, fontWeight: '800' },
  details: { padding: 7, paddingTop: 12, gap: 5 },
  category: { color: palette.muted, fontSize: 9, letterSpacing: 1.1 },
  name: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  price: { color: palette.ink, fontSize: 14, fontWeight: '800' },
  availability: { color: palette.success, fontSize: 11, fontWeight: '600' },
  outOfStock: { color: palette.danger, fontWeight: '700' },
  addControls: { gap: 7, paddingHorizontal: 4, paddingBottom: 4 },
  stepper: { height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: palette.line, borderRadius: 9 },
  stepButton: { width: 38, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: palette.ink, fontSize: 19, fontWeight: '600' },
  disabledStep: { opacity: 0.4 },
  selectedQuantity: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  addButton: { minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: palette.gold },
  addButtonText: { color: palette.white, fontSize: 12, fontWeight: '700' },
});
