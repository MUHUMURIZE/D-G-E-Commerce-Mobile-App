import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';

export default function RestockProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { notify } = useNotifications();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1) {
      setError(t('invalidQuantity'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminService.restockProduct(id, amount);
      notify(t('restockSuccess'));
      router.replace('/admin/products');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('unknownError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={adminStyles.screen} contentContainerStyle={adminStyles.content}>
      <AdminHeader title={t('restockProduct')} />
      <Text style={styles.hint}>{t('restockQuantity')}</Text>
      {error ? <Message error>{error}</Message> : null}
      <AppInput label={t('quantity')} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
      <AppButton title={t('restock')} onPress={() => { void submit(); }} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ hint: { color: palette.muted, fontSize: 14 } });
