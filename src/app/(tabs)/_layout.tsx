import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.gold,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
        tabBarStyle: { height: 62, paddingTop: 7, borderTopColor: palette.line, backgroundColor: palette.white },
      }}>
      <Tabs.Screen name="index" options={{ title: t('home') }} />
      <Tabs.Screen name="categories" options={{ title: t('categories') }} />
      <Tabs.Screen name="cart" options={{ title: t('cart') }} />
      <Tabs.Screen name="orders" options={{ title: t('orders') }} />
      <Tabs.Screen name="profile" options={{ title: t('profile') }} />
    </Tabs>
  );
}
