import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.price} Rwandan francs`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={styles.card}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.category}>{product.category.toUpperCase()}</Text>
        <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatRwf(product.price)}</Text>
        <Text style={styles.availability}>{product.availabilityStatus}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, marginBottom: 18, minWidth: 0 },
  image: { width: '100%', aspectRatio: 0.82, backgroundColor: palette.goldLight, borderRadius: 4 },
  details: { paddingTop: 10, gap: 4 },
  category: { color: palette.muted, fontSize: 10, letterSpacing: 1.3 },
  name: { color: palette.ink, fontSize: 14, fontWeight: '600' },
  price: { color: palette.ink, fontSize: 13 },
  availability: { color: palette.muted, fontSize: 11 },
});
