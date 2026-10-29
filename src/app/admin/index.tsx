import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type AdminAnalytics, type AdminDashboard } from '@/api/adminService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { useAppDispatch } from '@/redux/hooks';
import { signOut } from '@/redux/slices/authSlice';

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.dashboard());
      setAnalyticsError(null);
      try {
        setAnalytics(await adminService.analytics());
      } catch (requestError) {
        setAnalyticsError(requestError instanceof Error ? requestError.message : t('loadError'));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const stats = [
    ['totalUsers', data?.totalUsers],
    ['totalProducts', data?.totalProducts],
    ['totalOrders', data?.totalOrders],
    ['totalRevenue', data ? formatRwf(data.totalRevenue) : undefined],
    ['lowStockItems', data?.lowStockProducts],
    ['outOfStockItems', data?.outOfStockProducts],
  ] as const;

  return (
    <ScrollView
      style={adminStyles.screen}
      contentContainerStyle={adminStyles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void load(); }} tintColor={palette.gold} />}>
      <AdminHeader title={t('dashboard')} subtitle={t('adminPanel')} />
      {error ? <Message error>{error}</Message> : null}
      {loading && !data ? <ActivityIndicator color={palette.gold} /> : null}
      {!loading && !data && !error ? <EmptyState title={t('errorTitle')} body={t('loadError')} /> : null}
      <View style={styles.grid}>
        {stats.map(([key, value]) => (
          <View key={key} style={styles.stat}>
            <Text style={styles.statLabel}>{t(key)}</Text>
            <Text style={styles.statValue}>{value === undefined ? '—' : value}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.section}>{t('analytics')}</Text>
      {analyticsError ? <Message error>{analyticsError}</Message> : null}
      {analytics ? (
        <>
          <AnalyticsList title={t('topSellingProducts')} rows={analytics.topSellingProducts.map((item) => `${item.name} · ${item.unitsSold} ${t('unitsSold')}`)} />
          <AnalyticsList title={t('mostViewedProducts')} rows={analytics.mostViewedProducts.map((item) => `${item.name} · ${item.views}`)} />
          <AnalyticsList title={t('mostReviewedProducts')} rows={analytics.mostReviewedProducts.map((item) => `${item.name} · ${item.reviewCount}`)} />
          <AnalyticsList title={t('lowestStockProducts')} rows={analytics.lowestStockProducts.map((item) => `${item.name} · ${item.stock}`)} />
          <AnalyticsList title={t('monthlyOrders')} rows={analytics.monthlyOrders.map((item) => `${item.month} · ${item.orders}`)} />
          <AnalyticsList title={t('monthlyRevenue')} rows={analytics.monthlyRevenue.map((item) => `${item.month} · ${formatRwf(item.revenue)}`)} />
        </>
      ) : null}
      <Text style={styles.section}>{t('inventory')}</Text>
      <AppButton title={t('allProducts')} onPress={() => router.push('/admin/products')} />
      <AppButton title={t('users')} secondary onPress={() => router.push('/admin/users')} />
      <AppButton title={t('customerOrders')} secondary onPress={() => router.push('/admin/orders')} />
      <AppButton title={t('reviewsManagement')} secondary onPress={() => router.push('/admin/reviews' as Href)} />
      <AppButton title={t('createProduct')} variant="success" onPress={() => router.push('/admin/products/new')} />
      <AppButton title={t('signOut')} variant="danger" onPress={() => { void dispatch(signOut()); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: {
    width: '48%',
    flexGrow: 1,
    minHeight: 112,
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statLabel: { color: palette.muted, fontSize: 13, fontWeight: '600' },
  statValue: { color: palette.ink, fontSize: 24, fontWeight: '800' },
  section: { color: palette.ink, fontSize: 17, fontWeight: '700', marginTop: 8 },
  analyticsCard: { padding: 14, marginBottom: 10, borderWidth: 1, borderColor: palette.line, borderRadius: 14, backgroundColor: palette.white },
  analyticsTitle: { marginBottom: 7, color: palette.ink, fontSize: 14, fontWeight: '800' },
  analyticsRow: { paddingVertical: 4, color: palette.muted, fontSize: 12 },
});

function AnalyticsList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>{title}</Text>
      {rows.length ? rows.map((row, index) => (
        <Text key={`${title}-${index}`} style={styles.analyticsRow}>{row}</Text>
      )) : <Text style={styles.analyticsRow}>—</Text>}
    </View>
  );
}
