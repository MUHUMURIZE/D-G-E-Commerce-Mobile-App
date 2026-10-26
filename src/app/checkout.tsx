import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthGate } from '@/components/auth-gate';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearCart, selectCartTotal } from '@/redux/slices/cartSlice';
import { submitOrder } from '@/redux/slices/orderSlice';
import type { PaymentMethod, ShippingAddress } from '@/types';

const schema = Yup.object({
  fullName: Yup.string().min(2).required('Full name is required.'),
  phone: Yup.string().matches(/^(\+?250\d{9}|0\d{9})$/, 'Enter a valid Rwanda phone number.').required('Phone number is required.'),
  province: Yup.string().required('Province is required.'),
  district: Yup.string().required('District is required.'),
  sector: Yup.string().required('Sector is required.'),
  street: Yup.string().required('Street or delivery directions are required.'),
});

const initialAddress: ShippingAddress = {
  fullName: '', phone: '', province: 'Kigali City', district: '', sector: '', street: '',
};

function CheckoutContent() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { submitting, error } = useAppSelector((state) => state.orders);
  const subtotal = selectCartTotal(items);
  const delivery = subtotal >= 200000 ? 0 : 5000;
  const hasOutOfStockItems = items.some(({ product }) => product.availabilityStatus === 'Out Of Stock');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>Your bag is empty</Text>
        <AppButton title="RETURN TO SHOPPING" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text onPress={() => router.back()} style={styles.back}>‹  BACK TO BAG</Text>
      <Text style={styles.eyebrow}>SECURE CHECKOUT</Text>
      <Text style={styles.title}>Delivery details</Text>
      {error ? <Message error>{error}</Message> : null}
      {hasOutOfStockItems ? <Message error>Remove out-of-stock items before placing your order.</Message> : null}
      <Formik
        initialValues={initialAddress}
        validationSchema={schema}
        onSubmit={async (address) => {
          const result = await dispatch(submitOrder({ items, address, paymentMethod }));
          if (submitOrder.fulfilled.match(result)) {
            dispatch(clearCart());
            router.replace({ pathname: '/confirmation', params: { id: result.payload.id } });
          }
        }}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <AppInput label="Full name" value={values.fullName} onChangeText={handleChange('fullName')} onBlur={handleBlur('fullName')} error={touched.fullName ? errors.fullName : undefined} autoComplete="name" />
            <AppInput label="Phone number" value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} error={touched.phone ? errors.phone : undefined} keyboardType="phone-pad" placeholder="+250 7XX XXX XXX" />
            <View style={styles.twoCol}>
              <View style={styles.field}><AppInput label="Province" value={values.province} onChangeText={handleChange('province')} onBlur={handleBlur('province')} error={touched.province ? errors.province : undefined} /></View>
              <View style={styles.field}><AppInput label="District" value={values.district} onChangeText={handleChange('district')} onBlur={handleBlur('district')} error={touched.district ? errors.district : undefined} /></View>
            </View>
            <AppInput label="Sector" value={values.sector} onChangeText={handleChange('sector')} onBlur={handleBlur('sector')} error={touched.sector ? errors.sector : undefined} />
            <AppInput label="Street / delivery directions" value={values.street} onChangeText={handleChange('street')} onBlur={handleBlur('street')} error={touched.street ? errors.street : undefined} multiline />
            <Text style={styles.section}>PAYMENT METHOD</Text>
            {([
              ['mobile_money', 'Mobile Money', 'MTN MoMo or Airtel Money'],
              ['card', 'Debit / credit card', 'Visa or Mastercard'],
              ['cash_on_delivery', 'Cash on delivery', 'Pay when your order arrives'],
            ] as const).map(([value, label, note]) => (
              <Pressable key={value} onPress={() => setPaymentMethod(value)} style={styles.payment}>
                <View style={[styles.radio, paymentMethod === value && styles.radioSelected]} />
                <View><Text style={styles.paymentLabel}>{label}</Text><Text style={styles.note}>{note}</Text></View>
              </Pressable>
            ))}
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Order total</Text>
                <Text style={styles.note}>Delivery: {delivery ? formatRwf(delivery) : 'FREE'}</Text>
              </View>
              <Text style={styles.totalValue}>{formatRwf(subtotal + delivery)}</Text>
            </View>
            <AppButton
              title="PLACE ORDER"
              onPress={() => handleSubmit()}
              loading={submitting}
              disabled={hasOutOfStockItems}
            />
          </>
        )}
      </Formik>
    </ScrollView>
  );
}

export default function CheckoutScreen() {
  return <AuthGate redirectTo="/checkout"><CheckoutContent /></AuthGate>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36, gap: 13 },
  empty: { flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: palette.paper },
  back: { color: palette.muted, fontSize: 10, letterSpacing: 1, marginVertical: 6 },
  eyebrow: { color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { color: palette.ink, fontSize: 26, fontWeight: '600' },
  twoCol: { flexDirection: 'row', gap: 12 },
  field: { flex: 1 },
  section: { marginTop: 14, marginBottom: 2, color: palette.muted, fontSize: 10, letterSpacing: 1.5 },
  payment: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 4 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: palette.muted },
  radioSelected: { borderColor: palette.gold, backgroundColor: palette.gold, borderWidth: 5 },
  paymentLabel: { color: palette.ink, fontWeight: '600', fontSize: 13 },
  note: { color: palette.muted, marginTop: 3, fontSize: 11 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: palette.line, paddingVertical: 17, marginTop: 8 },
  totalLabel: { color: palette.ink, fontSize: 14, fontWeight: '600' },
  totalValue: { color: palette.ink, fontSize: 15, fontWeight: '700' },
});
