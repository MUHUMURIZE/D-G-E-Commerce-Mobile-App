import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signOut } from '@/redux/slices/authSlice';
import type { Href } from 'expo-router';

const links: { icon: string; label: string; route: Href }[] = [
  { icon: '🏠', label: 'dashboard', route: '/(tabs)' },
  { icon: '🛍️', label: 'browseProducts', route: '/(tabs)/categories' },
  { icon: '📂', label: 'categories', route: '/(tabs)/categories' },
  { icon: '🛒', label: 'cart', route: '/(tabs)/cart' },
  { icon: '📦', label: 'orders', route: '/(tabs)/orders' },
  { icon: '👤', label: 'profile', route: '/(tabs)/profile' },
];

export function CustomerNavigation() {
  const { width } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const user = useAppSelector((state) => state.auth.session?.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const desktop = width >= 768;

  const navigate = (route: Href) => {
    setDrawerOpen(false);
    router.push(route);
  };

  const changeLanguage = async (language: 'en' | 'rw' | 'fr') => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('@dg/language', language);
      setDrawerOpen(false);
      setLanguageOpen(false);
    } catch (error) {
      notify(error instanceof Error ? error.message : t('languageSaveError'), 'error');
    }
  };

  const logout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      setDrawerOpen(false);
      router.replace('/login');
    } catch (error) {
      notify(error instanceof Error ? error.message : t('unknownError'), 'error');
    }
  };

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        {desktop ? (
          <>
            <Pressable accessibilityRole="link" onPress={() => navigate('/(tabs)')} style={styles.brandWrap}>
              <Text style={styles.brand}>{t('brand')}</Text>
              <Text style={styles.storeName}>{t('store')}</Text>
            </Pressable>
            <View style={styles.desktopLinks}>
              {links.filter((link) => link.label !== 'browseProducts').map((link) => (
                <Pressable key={link.label} accessibilityRole="link" onPress={() => navigate(link.route)} style={styles.desktopLink}>
                  <Text style={styles.desktopLinkText}>{t(link.label === 'dashboard' ? 'home' : link.label)}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('openMenu')}
              accessibilityState={{ expanded: drawerOpen }}
              onPress={() => setDrawerOpen(true)}
              style={styles.menuButton}>
              <Text style={styles.menuGlyph}>☰</Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => navigate('/(tabs)')} style={styles.mobileBrand}>
              <Text style={styles.mobileBrandText}>{t('brand')} {t('store')}</Text>
            </Pressable>
          </>
        )}
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.paper },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="profile" />
      </Stack>
      {!desktop && drawerOpen ? (
        <View style={styles.drawerLayer}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('closeMenu')} onPress={() => setDrawerOpen(false)} style={styles.scrim} />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatar}><Text style={styles.drawerAvatarText}>{user?.name.slice(0, 1).toUpperCase() ?? 'D'}</Text></View>
              <View style={styles.drawerGreeting}>
                <Text style={styles.drawerTitle}>{t('welcomeUser', { name: user?.name ?? '' })}</Text>
                <Text style={styles.drawerEmail}>{user?.email}</Text>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.drawerLinks}>
              {links.map((link) => (
                <Pressable key={link.label} accessibilityRole="button" onPress={() => navigate(link.route)} style={styles.drawerLink}>
                  <Text style={styles.drawerIcon}>{link.icon}</Text>
                  <Text style={styles.drawerLinkText}>{t(link.label)}</Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: languageOpen }}
                onPress={() => setLanguageOpen((open) => !open)}
                style={styles.drawerLink}>
                <Text style={styles.drawerIcon}>🌐</Text>
                <Text style={styles.drawerLinkText}>{t('language')}</Text>
                <Text style={styles.expandIcon}>{languageOpen ? '−' : '+'}</Text>
              </Pressable>
              {languageOpen ? (
                <View style={styles.languageOptions}>
                  {(['en', 'rw', 'fr'] as const).map((code) => (
                    <Pressable key={code} accessibilityRole="button" onPress={() => { void changeLanguage(code); }} style={styles.languageOption}>
                      <Text style={styles.languageText}>{t(code === 'en' ? 'english' : code === 'rw' ? 'kinyarwanda' : 'french')}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: aboutOpen }}
                onPress={() => setAboutOpen((open) => !open)}
                style={styles.drawerLink}>
                <Text style={styles.drawerIcon}>ℹ️</Text>
                <Text style={styles.drawerLinkText}>{t('aboutApp')}</Text>
                <Text style={styles.expandIcon}>{aboutOpen ? '−' : '+'}</Text>
              </Pressable>
              {aboutOpen ? <Text style={styles.aboutText}>{t('aboutAppInfo')}</Text> : null}
              <View style={styles.divider} />
              <Pressable accessibilityRole="button" onPress={() => { void logout(); }} style={styles.drawerLink}>
                <Text style={styles.drawerIcon}>🚪</Text>
                <Text style={styles.logoutText}>{t('signOut')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: palette.paper },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, backgroundColor: palette.white, borderBottomWidth: 1, borderBottomColor: palette.line, zIndex: 2 },
  brandWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  brand: { color: palette.gold, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  storeName: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  desktopLinks: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  desktopLink: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9 },
  desktopLinkText: { color: palette.ink, fontSize: 13, fontWeight: '600' },
  menuButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: palette.paper },
  menuGlyph: { color: palette.ink, fontSize: 22, fontWeight: '700' },
  mobileBrand: { flex: 1, marginLeft: 12 },
  mobileBrandText: { color: palette.ink, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  drawerLayer: { ...StyleSheet.absoluteFill, zIndex: 5, flexDirection: 'row' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17,24,39,0.44)' },
  drawer: { width: 310, maxWidth: '84%', height: '100%', backgroundColor: palette.white, shadowColor: palette.shadow, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 4, height: 0 }, elevation: 12 },
  drawerHeader: { minHeight: 118, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, backgroundColor: palette.goldLight, borderBottomWidth: 1, borderBottomColor: palette.line },
  drawerAvatar: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: palette.gold },
  drawerAvatarText: { color: palette.white, fontSize: 20, fontWeight: '800' },
  drawerGreeting: { flex: 1 },
  drawerTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  drawerEmail: { marginTop: 4, color: palette.muted, fontSize: 11 },
  drawerLinks: { paddingVertical: 12 },
  drawerLink: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 20 },
  drawerIcon: { width: 25, fontSize: 18 },
  drawerLinkText: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '600' },
  expandIcon: { color: palette.muted, fontSize: 19 },
  languageOptions: { marginLeft: 58, paddingBottom: 8 },
  languageOption: { paddingVertical: 8 },
  languageText: { color: palette.muted, fontSize: 13 },
  aboutText: { marginHorizontal: 58, marginBottom: 8, color: palette.muted, fontSize: 12, lineHeight: 18 },
  divider: { height: 1, marginVertical: 10, marginHorizontal: 20, backgroundColor: palette.line },
  logoutText: { color: palette.danger, fontSize: 14, fontWeight: '700' },
});
