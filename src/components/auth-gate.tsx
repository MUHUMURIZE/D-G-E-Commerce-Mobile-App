import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { palette } from '@/constants/palette';

export function AuthGate({ children, redirectTo }: {
  children: React.ReactNode;
  redirectTo?: '/checkout' | '/(tabs)/orders' | '/(tabs)/profile';
}) {
  const { session, initialized } = useAppSelector((state) => state.auth);
  if (!initialized) {
    return <View style={styles.loading}><ActivityIndicator color={palette.gold} /></View>;
  }
  if (!session) return <Redirect href={{ pathname: '/login', params: { returnTo: redirectTo } }} />;
  return children;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.paper },
});
