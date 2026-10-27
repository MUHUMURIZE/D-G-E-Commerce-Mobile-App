import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { palette } from '@/constants/palette';

export function AuthGate({ children }: {
  children: React.ReactNode;
}) {
  const { session, initialized } = useAppSelector((state) => state.auth);
  if (!initialized) {
    return <View style={styles.loading}><ActivityIndicator color={palette.gold} /></View>;
  }
  if (!session) return <Redirect href="/login" />;
  return children;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.paper },
});
