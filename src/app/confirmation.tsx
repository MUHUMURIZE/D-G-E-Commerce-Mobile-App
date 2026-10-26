import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/components/ui/app-button';
import { palette } from '@/constants/palette';

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.screen}>
      <Text style={styles.mark}>D&amp;G</Text>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.title}>Thank you for your order.</Text>
      <Text style={styles.copy}>Your order has been received. We’ll keep you updated as it makes its way to you.</Text>
      {id ? <Text style={styles.order}>ORDER {id.toUpperCase()}</Text> : null}
      <AppButton title="TRACK YOUR ORDER" onPress={() => router.replace({ pathname: '/order/[id]', params: { id: id ?? '' } })} />
      <Text onPress={() => router.replace('/(tabs)')} style={styles.continue}>Continue shopping</Text>
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
