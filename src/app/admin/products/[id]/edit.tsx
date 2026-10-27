import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type AdminProduct, type ProductInput } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';

const categories = ['Clothes', 'Shoes', 'Bags', 'Jewellery', 'Cosmetics', 'Household Equipment'];

export default function EditAdminProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { notify } = useNotifications();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<ProductInput['image']>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await adminService.product(id);
      setProduct(result);
      setCategory(result.category);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    }
  }, [id, t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      setError(t('imageSizeError'));
      return;
    }
    const type = asset.mimeType ?? 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
      setError(t('imageTypeError'));
      return;
    }
    setImage({ uri: asset.uri, name: asset.fileName ?? `product.${type.split('/')[1]}`, type, file: asset.file });
    setError(null);
  };

  const submit = async (values: { name: string; description: string; price: string; stock: string; rating: string }) => {
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      await adminService.updateProduct(product.id, {
        ...values,
        category,
        price: Number(values.price),
        stock: Number(values.stock),
        rating: Number(values.rating),
        image,
      });
      notify(t('productSaved'));
      router.replace('/admin/products');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('unknownError'));
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return (
      <ScrollView style={adminStyles.screen} contentContainerStyle={adminStyles.content}>
        <AdminHeader title={t('editProduct')} />
        {error ? <Message error>{error}</Message> : <Text style={adminStyles.muted}>{t('loading')}</Text>}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={adminStyles.screen} contentContainerStyle={adminStyles.content} keyboardShouldPersistTaps="handled">
      <AdminHeader title={t('editProduct')} />
      {error ? <Message error>{error}</Message> : null}
      <AppInput label={t('productName')} defaultValue={product.name} onChangeText={(value) => setProduct({ ...product, name: value })} />
      <Text style={styles.label}>{t('category')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, item === category && styles.selectedChip]}>
            <Text style={[styles.chipText, item === category && styles.selectedText]}>{t(item)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <AppInput label={t('description')} defaultValue={product.description} onChangeText={(value) => setProduct({ ...product, description: value })} multiline style={styles.multiline} />
      <AppInput label={t('priceRwf')} defaultValue={String(product.price)} onChangeText={(value) => setProduct({ ...product, price: Number(value) })} keyboardType="decimal-pad" />
      <AppInput label={t('stockQuantity')} defaultValue={String(product.stock)} onChangeText={(value) => setProduct({ ...product, stock: Number(value) })} keyboardType="number-pad" />
      <AppInput label={t('rating')} defaultValue={String(product.rating)} onChangeText={(value) => setProduct({ ...product, rating: Number(value) })} keyboardType="decimal-pad" />
      <Text style={styles.label}>{t('productImage')}</Text>
      <Image source={{ uri: image?.uri ?? product.imageUrl }} style={styles.preview} />
      <AppButton title={t('changeImage')} secondary onPress={() => { void chooseImage(); }} />
      <AppButton
        title={t('updateProduct')}
        onPress={() => { void submit({ name: product.name, description: product.description, price: String(product.price), stock: String(product.stock), rating: String(product.rating) }); }}
        loading={saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  selectedChip: { backgroundColor: palette.gold, borderColor: palette.gold },
  chipText: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  selectedText: { color: palette.white },
  multiline: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  preview: { width: '100%', height: 220, borderRadius: 14, backgroundColor: palette.line },
});
