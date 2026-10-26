import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '@/translations/i18n';
import { setUnauthorizedHandler } from '@/api/client';
import { store } from '@/redux/store';
import { useAppDispatch } from '@/redux/hooks';
import { restoreSession, signOut } from '@/redux/slices/authSlice';
import { palette } from '@/constants/palette';

function AppNavigator() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    void dispatch(restoreSession());
    setUnauthorizedHandler(() => { void dispatch(signOut()); });
    AsyncStorage.getItem('@dg/language').then((language) => {
      if (language === 'en' || language === 'rw') return i18n.changeLanguage(language);
      return undefined;
    }).catch(() => {
      console.warn('Could not restore saved language preference.');
    });
  }, [dispatch]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.paper, paddingTop: insets.top },
        }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
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
