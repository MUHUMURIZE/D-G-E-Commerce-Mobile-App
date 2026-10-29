import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { reviewService } from '@/api/reviewService';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState, Message } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';
import { formatOrderDate } from '@/utils/formatDate';
import type { ProductReview } from '@/types';

type ReviewFilter = 'all' | 'pending' | 'approved';

export default function AdminReviewsScreen() {
  const { t, i18n } = useTranslation();
  const { notify } = useNotifications();
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await reviewService.adminList(filter));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const approve = async (review: ProductReview) => {
    try {
      await reviewService.approve(review.id);
      notify(t('reviewApproved'));
      await load();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('reviewSaveError');
      setError(message);
      notify(message, 'error');
    }
  };

  const remove = (review: ProductReview) => {
    Alert.alert(t('removeReview'), t('confirmRemoveReview', { title: review.title }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('remove'),
        style: 'destructive',
        onPress: () => {
          void reviewService.remove(review.id).then(async () => {
            notify(t('reviewRemoved'));
            await load();
          }).catch((requestError: unknown) => {
            const message = requestError instanceof Error ? requestError.message : t('reviewSaveError');
            setError(message);
            notify(message, 'error');
          });
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={adminStyles.screen}
      contentContainerStyle={adminStyles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void load(); }} tintColor={palette.gold} />}>
      <AdminHeader title={t('reviewsManagement')} subtitle={t('reviewModerationSubtitle')} />
      {error ? <Message error>{error}</Message> : null}
      <View style={styles.filters}>
        {(['all', 'pending', 'approved'] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === value }}
            onPress={() => setFilter(value)}
            style={[styles.filter, filter === value && styles.selectedFilter]}>
            <Text style={[styles.filterText, filter === value && styles.selectedFilterText]}>{t(value)}</Text>
          </Pressable>
        ))}
      </View>
      {loading && !reviews.length ? <ActivityIndicator color={palette.gold} /> : null}
      {!loading && !reviews.length && !error ? <EmptyState title={t('noReviews')} body={t('noReviewsBody')} /> : null}
      {reviews.map((review) => (
        <View key={review.id} style={styles.card}>
          <View style={styles.top}>
            <Text style={styles.stars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
            <Text style={[styles.status, review.status === 'approved' && styles.approved]}>
              {t(review.status)}
            </Text>
          </View>
          <Text style={styles.product}>{review.Product?.name ?? t('products')}</Text>
          <Text style={styles.title}>{review.title}</Text>
          <Text style={styles.comment}>{review.comment}</Text>
          <Text style={styles.meta}>{review.User?.fullName ?? t('customer')} · {review.User?.email ?? ''}</Text>
          <Text style={styles.meta}>{formatOrderDate(review.created_at, i18n.resolvedLanguage ?? i18n.language)}</Text>
          <View style={styles.actions}>
            {review.status !== 'approved' ? (
              <AppButton title={t('approveReview')} variant="success" onPress={() => { void approve(review); }} />
            ) : null}
            <AppButton title={t('removeReview')} variant="danger" onPress={() => remove(review)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filter: { flex: 1, alignItems: 'center', paddingVertical: 10, borderWidth: 1, borderColor: palette.line, borderRadius: 10, backgroundColor: palette.white },
  selectedFilter: { borderColor: palette.gold, backgroundColor: palette.gold },
  filterText: { color: palette.ink, fontSize: 12, fontWeight: '700' },
  selectedFilterText: { color: palette.white },
  card: { padding: 15, marginBottom: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 15, backgroundColor: palette.white },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stars: { color: palette.gold, fontSize: 16 },
  status: { color: palette.warning, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  approved: { color: palette.success },
  product: { marginTop: 7, color: palette.muted, fontSize: 11 },
  title: { marginTop: 5, color: palette.ink, fontSize: 16, fontWeight: '800' },
  comment: { marginTop: 6, color: palette.ink, fontSize: 13, lineHeight: 19 },
  meta: { marginTop: 7, color: palette.muted, fontSize: 11 },
  actions: { gap: 8, marginTop: 12 },
});
