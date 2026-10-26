import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { productService } from '@/api/productService';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';

export default function ProductDetailsScreen() {
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

  if (loading) return <ActivityIndicator style={styles.loading} color={palette.gold} />;
  if (!product) {
    return error
      ? <Message error>{error}</Message>
      : <EmptyState title="Product unavailable" body="This product may have been removed from the collection." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.back} onPress={() => router.back()}>‹  BACK TO COLLECTION</Text>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <Text style={styles.category}>{product.category.toUpperCase()}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formatRwf(product.price)}</Text>
      <Text style={styles.rating}>★ {product.rating.toFixed(1)}  ·  {product.availabilityStatus}</Text>
      <View style={styles.divider} />
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.shipping}>Complimentary delivery on orders over 200,000 RWF.</Text>
      <AppButton
        title={product.availabilityStatus === 'Out Of Stock' ? 'OUT OF STOCK' : 'ADD TO BAG'}
        disabled={product.availabilityStatus === 'Out Of Stock'}
        onPress={() => {
          dispatch(addToCart(product));
          router.push('/(tabs)/cart');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  back: { marginVertical: 10, color: palette.muted, fontSize: 10, letterSpacing: 1 },
  image: { width: '100%', aspectRatio: 0.95, marginBottom: 20, borderRadius: 4, backgroundColor: palette.goldLight },
  category: { color: palette.gold, fontSize: 10, letterSpacing: 1.5 },
  name: { marginTop: 8, color: palette.ink, fontSize: 27, fontWeight: '600' },
  price: { marginTop: 10, color: palette.ink, fontSize: 17 },
  rating: { marginTop: 12, color: palette.muted, fontSize: 13 },
  divider: { height: 1, backgroundColor: palette.line, marginVertical: 20 },
  description: { color: palette.ink, fontSize: 15, lineHeight: 24 },
  shipping: { color: palette.muted, marginTop: 18, marginBottom: 22, fontSize: 12 },
});
