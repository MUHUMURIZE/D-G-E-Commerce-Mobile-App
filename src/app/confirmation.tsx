import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/app-button';
import { palette } from '@/constants/palette';

export default function ConfirmationScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.screen}>
      <Text style={styles.mark}>D&amp;G</Text>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.title}>{t('thankYou')}</Text>
      <Text style={styles.copy}>{t('orderReceived')}</Text>
      {id ? <Text style={styles.order}>{t('orderId', { id: id.toUpperCase() })}</Text> : null}
      <AppButton title={t('trackYourOrder')} onPress={() => router.replace({ pathname: '/order/[id]', params: { id: id ?? '' } })} />
      <Text onPress={() => router.replace('/(tabs)')} style={styles.continue}>{t('continueShopping')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 26, backgroundColor: palette.paper },
  mark: { color: palette.ink, fontSize: 30, letterSpacing: 8, textAlign: 'center' },
  check: { alignSelf: 'center', marginTop: 42, marginBottom: 18, color: palette.success, fontSize: 28 },
  title: { color: palette.ink, fontSize: 25, textAlign: 'center', fontWeight: '600' },
  copy: { color: palette.muted, textAlign: 'center', lineHeight: 22, marginVertical: 14 },
  order: { textAlign: 'center', color: palette.gold, fontSize: 11, letterSpacing: 1.5, marginBottom: 26 },
  continue: { textAlign: 'center', padding: 16, color: palette.muted, textDecorationLine: 'underline' },
});
