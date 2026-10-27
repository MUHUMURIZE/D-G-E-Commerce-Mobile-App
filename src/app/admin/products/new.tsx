import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type ProductInput } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';

const categories = ['Clothes', 'Shoes', 'Bags', 'Jewellery', 'Cosmetics', 'Household Equipment'];

export default function NewAdminProductScreen() {
  const { t } = useTranslation();
  const { notify } = useNotifications();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [rating, setRating] = useState('0');
  const [image, setImage] = useState<ProductInput['image']>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
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
    setImage({
      uri: asset.uri,
      name: asset.fileName ?? `product.${type.split('/')[1]}`,
      type,
      file: asset.file,
    });
    setError(null);
  };

  const submit = async () => {
    if (!name.trim() || !description.trim() || !Number.isFinite(Number(price)) || Number(price) < 0
      || !Number.isInteger(Number(stock)) || Number(stock) < 0
      || !Number.isFinite(Number(rating)) || Number(rating) < 0 || Number(rating) > 5 || !image) {
      setError(!image ? t('imageRequired') : t('required'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminService.createProduct({
        name: name.trim(),
        category,
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: Number(rating),
        image,
      });
      notify(t('productSaved'));
      router.replace('/admin/products');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('unknownError');
      setError(message);
      notify(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={adminStyles.screen} contentContainerStyle={adminStyles.content} keyboardShouldPersistTaps="handled">
      <AdminHeader title={t('createProduct')} />
      {error ? <Message error>{error}</Message> : null}
      <AppInput label={t('productName')} value={name} onChangeText={setName} />
      <Text style={styles.label}>{t('category')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, item === category && styles.selectedChip]}>
            <Text style={[styles.chipText, item === category && styles.selectedText]}>{t(item)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <AppInput label={t('description')} value={description} onChangeText={setDescription} multiline style={styles.multiline} />
      <AppInput label={t('priceRwf')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <AppInput label={t('stockQuantity')} value={stock} onChangeText={setStock} keyboardType="number-pad" />
      <AppInput label={t('rating')} value={rating} onChangeText={setRating} keyboardType="decimal-pad" />
      <Text style={styles.label}>{t('productImage')}</Text>
      <Text style={adminStyles.muted}>{t('uploadImageHint')}</Text>
      {image ? <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" /> : null}
      <AppButton title={image ? t('changeImage') : t('chooseImage')} secondary onPress={() => { void chooseImage(); }} />
      <AppButton title={t('saveProduct')} onPress={() => { void submit(); }} loading={saving} />
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
