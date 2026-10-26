import { Tabs } from 'expo-router';
import { palette } from '@/constants/palette';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.gold,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
        tabBarStyle: { height: 62, paddingTop: 7, borderTopColor: palette.line, backgroundColor: palette.white },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
      <Tabs.Screen name="cart" options={{ title: 'Bag' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
