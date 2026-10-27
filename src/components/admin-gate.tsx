import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { palette } from '@/constants/palette';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAppSelector((state) => state.auth);
  if (!initialized) {
    return <View style={styles.loading}><ActivityIndicator color={palette.gold} /></View>;
  }
  if (!session) return <Redirect href="/login" />;
  if (session.user.role !== 'admin') return <Redirect href="/(tabs)" />;
  return children;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper },
});
