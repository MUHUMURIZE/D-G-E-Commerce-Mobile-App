import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { notificationService } from '@/api/notificationService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { formatOrderDate } from '@/utils/formatDate';
import type { AppNotification } from '@/types';

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await notificationService.list());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    const interval = setInterval(() => { void load(); }, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (item: AppNotification) => {
    if (!item.readAt) {
      try {
        const updated = await notificationService.markRead(item.id);
        setItems((current) => current.map((notification) => notification.id === item.id ? updated : notification));
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : t('notificationUpdateError'));
        return;
      }
    }
    if (item.type.startsWith('order_') && item.entityId) {
      router.push({ pathname: '/order/[id]', params: { id: item.entityId } });
    } else if ((item.type === 'product_restocked' || item.type === 'review_approved') && item.entityId) {
      router.push({ pathname: '/product/[id]', params: { id: item.entityId } });
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('notificationUpdateError'));
    }
  };

  const unreadCount = items.filter((item) => !item.readAt).length;
  return (
    <ScrollView
      style={adminStyles.screen}
      contentContainerStyle={adminStyles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void load(); }} tintColor={palette.gold} />}>
      <AdminHeader title={t('notificationTitle')} subtitle={t('notificationCenterSubtitle')} />
      {error ? <Message error>{error}</Message> : null}
      {loading && !items.length ? <ActivityIndicator color={palette.gold} /> : null}
      {items.length > 0 && unreadCount > 0 ? (
        <Pressable accessibilityRole="button" onPress={() => { void markAllRead(); }} style={styles.markAll}>
          <Text style={styles.markAllText}>{t('markAllRead')} ({unreadCount})</Text>
        </Pressable>
      ) : null}
      {!loading && !items.length && !error ? (
        <EmptyState title={t('noNotifications')} body={t('notificationPlaceholder')} />
      ) : null}
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.description}`}
          onPress={() => { void markRead(item); }}
          style={[styles.card, !item.readAt && styles.unreadCard]}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={[styles.status, !item.readAt && styles.unreadStatus]}>
              <Text style={[styles.statusText, !item.readAt && styles.unreadStatusText]}>
                {t(item.readAt ? 'read' : 'unread')}
              </Text>
            </View>
          </View>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>{formatOrderDate(item.created_at, i18n.resolvedLanguage ?? i18n.language)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  markAll: { alignSelf: 'flex-end', paddingVertical: 9, paddingHorizontal: 12, marginBottom: 8, borderRadius: 10, backgroundColor: palette.goldLight },
  markAllText: { color: palette.gold, fontSize: 12, fontWeight: '700' },
  card: { padding: 16, marginBottom: 10, borderWidth: 1, borderColor: palette.line, borderRadius: 15, backgroundColor: palette.white },
  unreadCard: { borderColor: palette.gold, backgroundColor: '#F8FAFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: palette.ink, fontSize: 15, fontWeight: '700' },
  status: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: palette.paper },
  unreadStatus: { backgroundColor: palette.goldLight },
  statusText: { color: palette.muted, fontSize: 10, fontWeight: '700' },
  unreadStatusText: { color: palette.gold },
  description: { marginTop: 8, color: palette.ink, fontSize: 13, lineHeight: 19 },
  date: { marginTop: 9, color: palette.muted, fontSize: 11 },
});
