import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const availability = product.availabilityStatus === 'Out Of Stock'
    ? t('outOfStock')
    : product.availabilityStatus.startsWith('Only ')
      ? t('onlyLeft', { count: product.availabilityStatus.match(/\d+/)?.[0] })
      : t('inStock');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.price} Rwandan francs`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        {product.availabilityStatus === 'Out Of Stock' ? (
          <View style={styles.outBadge}><Text style={styles.outBadgeText}>{t('outOfStock')}</Text></View>
        ) : null}
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{t(product.category).toUpperCase()}</Text>
        <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatRwf(product.price)}</Text>
        <Text style={[styles.availability, product.availabilityStatus === 'Out Of Stock' && styles.outOfStock]}>{availability}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, marginBottom: 18, minWidth: 0, padding: 8, borderRadius: 18, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, shadowColor: palette.shadow, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
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
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
