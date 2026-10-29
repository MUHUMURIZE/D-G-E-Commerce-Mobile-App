import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '@/translations/i18n';
import { setUnauthorizedHandler } from '@/api/client';
import { store } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { restoreSession, signOut } from '@/redux/slices/authSlice';
import { palette } from '@/constants/palette';
import { NotificationProvider } from '@/components/notification-center';
import { WishlistProvider } from '@/components/wishlist-provider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function AppNavigator() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { session, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    void dispatch(restoreSession());
    setUnauthorizedHandler(() => { void dispatch(signOut()); });
    AsyncStorage.getItem('@dg/language').then((language) => {
      if (language === 'en' || language === 'rw' || language === 'fr') return i18n.changeLanguage(language);
      return undefined;
    }).catch(() => {
      console.warn('Could not restore saved language preference.');
    });
  }, [dispatch]);

  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={palette.gold} />
      </View>
    );
  }

  const firstSegment = segments[0];
  const isAuthRoute = firstSegment === 'login' || firstSegment === 'register';
  if (!session && !isAuthRoute) return <Redirect href="/login" />;
  if (session && isAuthRoute) return <Redirect href={session.user.role === 'admin' ? '/admin' : '/(tabs)'} />;
  if (session?.user.role === 'customer' && firstSegment === 'admin') return <Redirect href="/(tabs)" />;

  return (
    <>
      <StatusBar style="dark" />
      <NotificationProvider>
        <WishlistProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.paper, paddingTop: insets.top },
            }}>
            <Stack.Screen name="index" />
          </Stack>
        </WishlistProvider>
      </NotificationProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper },
});
