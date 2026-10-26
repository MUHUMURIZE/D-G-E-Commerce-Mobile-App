import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearCart, removeFromCart, selectCartTotal, setQuantity } from '@/redux/slices/cartSlice';

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const items = useAppSelector((state) => state.cart.items);
  const subtotal = selectCartTotal(items);
  const delivery = items.length === 0 || subtotal >= 200000 ? 0 : 5000;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>D&amp;G · KIGALI</Text>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t('cart')}</Text>
        {items.length ? <Text onPress={() => dispatch(clearCart())} style={styles.clear}>Clear bag</Text> : null}
      </View>
      {!items.length ? (
        <EmptyState title={t('emptyCart')} body={t('emptyCartBody')} />
      ) : (
        <>
          {items.map(({ product, quantity }) => (
            <View key={product.id} style={styles.item}>
              <Image source={{ uri: product.imageUrl }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.category}>{product.category.toUpperCase()}</Text>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>{formatRwf(product.price)}</Text>
                <Text style={styles.availability}>{product.availabilityStatus}</Text>
                <View style={styles.actions}>
                  <Text onPress={() => dispatch(setQuantity({ productId: product.id, quantity: quantity - 1 }))} style={styles.quantityButton}>−</Text>
                  <Text style={styles.quantity}>{quantity}</Text>
                  <Text
                    accessibilityState={{ disabled: product.availabilityStatus === 'Out Of Stock' }}
                    onPress={product.availabilityStatus === 'Out Of Stock'
                      ? undefined
                      : () => dispatch(setQuantity({ productId: product.id, quantity: quantity + 1 }))}
                    style={[styles.quantityButton, product.availabilityStatus === 'Out Of Stock' && styles.disabledQuantityButton]}>+</Text>
                  <Text onPress={() => dispatch(removeFromCart(product.id))} style={styles.remove}>Remove</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={styles.summary}>
            <Row label={t('subtotal')} value={formatRwf(subtotal)} />
            <Row label={t('delivery')} value={delivery ? formatRwf(delivery) : 'FREE'} />
            <View style={styles.divider} />
            <Row label={t('total')} value={formatRwf(subtotal + delivery)} strong />
          </View>
          <AppButton
            title={t('checkout')}
            disabled={items.some(({ product }) => product.availabilityStatus === 'Out Of Stock')}
            onPress={() => router.push('/checkout')}
          />
          <Text style={styles.deliveryNote}>Free delivery in Rwanda on orders over 200,000 RWF.</Text>
        </>
      )}
    </ScrollView>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginTop: 8, marginBottom: 18, fontSize: 28, fontWeight: '600', color: palette.ink },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clear: { marginTop: 8, marginBottom: 18, color: palette.muted, fontSize: 12, textDecorationLine: 'underline' },
  item: { flexDirection: 'row', gap: 14, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: palette.line },
  image: { width: 94, height: 116, borderRadius: 3, backgroundColor: palette.goldLight },
  details: { flex: 1, justifyContent: 'center', gap: 5 },
  category: { color: palette.muted, fontSize: 9, letterSpacing: 1.2 },
  name: { color: palette.ink, fontWeight: '600', fontSize: 15 },
  price: { color: palette.ink, fontSize: 13 },
  availability: { color: palette.muted, fontSize: 11 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 5 },
  quantityButton: { color: palette.ink, fontSize: 20, paddingHorizontal: 5 },
  disabledQuantityButton: { opacity: 0.45 },
  quantity: { color: palette.ink, fontSize: 13 },
  remove: { marginLeft: 'auto', color: palette.muted, textDecorationLine: 'underline', fontSize: 12 },
  summary: { gap: 14, paddingVertical: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: palette.muted, fontSize: 14 },
  rowValue: { color: palette.ink, fontSize: 14 },
  bold: { color: palette.ink, fontWeight: '700' },
  divider: { height: 1, backgroundColor: palette.line },
  deliveryNote: { color: palette.muted, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
