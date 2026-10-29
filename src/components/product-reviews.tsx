import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { reviewService } from '@/api/reviewService';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';
import { formatOrderDate } from '@/utils/formatDate';
import type { ProductReview, ProductReviews } from '@/types';

function stars(rating: number) {
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
}

export function ProductReviewsSection({ productId }: { productId: string }) {
  const { t, i18n } = useTranslation();
  const { notify } = useNotifications();
  const [data, setData] = useState<ProductReviews | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await reviewService.forProduct(productId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [productId, t]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await reviewService.create(productId, { rating, title: title.trim(), comment: comment.trim() });
      setTitle('');
      setComment('');
      await load();
      notify(t('reviewSubmitted'));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('reviewSaveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{t('customerReviews')}</Text>
        <Text style={styles.count}>{t('reviewsCount', { count: data?.items.length ?? 0 })}</Text>
      </View>
      {loading ? <ActivityIndicator color={palette.gold} /> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {data?.currentReview?.status === 'pending' ? (
        <Text style={styles.pending}>{t('reviewPending')}</Text>
      ) : null}
      {data && !data.canReview && !data.currentReview ? (
        <Text style={styles.empty}>{t('purchaseReviewHint')}</Text>
      ) : null}
      {data?.canReview ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{t('writeReview')}</Text>
          <View style={styles.ratingPicker}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={t('ratingValue', { count: value })}
                accessibilityState={{ selected: rating === value }}
                onPress={() => setRating(value)}>
                <Text style={[styles.star, value <= rating && styles.selectedStar]}>★</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            accessibilityLabel={t('reviewTitle')}
            placeholder={t('reviewTitle')}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            style={styles.input}
          />
          <TextInput
            accessibilityLabel={t('reviewComment')}
            placeholder={t('reviewComment')}
            value={comment}
            onChangeText={setComment}
            maxLength={2000}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.commentInput]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: saving || title.trim().length < 2 || comment.trim().length < 5 }}
            disabled={saving || title.trim().length < 2 || comment.trim().length < 5}
            onPress={() => { void submit(); }}
            style={styles.submit}>
            <Text style={styles.submitText}>{saving ? t('submittingReview') : t('submitReview')}</Text>
          </Pressable>
        </View>
      ) : null}
      {!loading && !data?.items.length ? <Text style={styles.empty}>{t('noReviews')}</Text> : null}
      {data?.items.map((review) => <ReviewCard key={review.id} review={review} locale={i18n.resolvedLanguage ?? i18n.language} />)}
    </View>
  );
}

function ReviewCard({ review, locale }: { review: ProductReview; locale: string }) {
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewStars}>{stars(review.rating)}</Text>
      <Text style={styles.reviewTitle}>{review.title}</Text>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <Text style={styles.reviewMeta}>
        {review.User?.fullName ?? 'Customer'}  ·  {formatOrderDate(review.created_at, locale)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  headingRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  heading: { color: palette.ink, fontSize: 18, fontWeight: '800' },
  count: { color: palette.muted, fontSize: 12 },
  form: { padding: 16, marginBottom: 14, borderRadius: 16, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white },
  formTitle: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  ratingPicker: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  star: { color: palette.line, fontSize: 28 },
  selectedStar: { color: palette.gold },
  input: { minHeight: 46, marginTop: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 10, color: palette.ink, backgroundColor: palette.white },
  commentInput: { minHeight: 100, paddingTop: 12 },
  submit: { minHeight: 46, justifyContent: 'center', alignItems: 'center', marginTop: 12, borderRadius: 10, backgroundColor: palette.gold },
  submitText: { color: palette.white, fontWeight: '700' },
  pending: { padding: 12, borderRadius: 10, color: palette.warning, backgroundColor: palette.goldLight },
  empty: { paddingVertical: 16, color: palette.muted },
  error: { marginBottom: 10, color: palette.danger },
  reviewCard: { padding: 15, marginBottom: 10, borderWidth: 1, borderColor: palette.line, borderRadius: 14, backgroundColor: palette.white },
  reviewStars: { color: palette.gold, fontSize: 16, letterSpacing: 1 },
  reviewTitle: { marginTop: 5, color: palette.ink, fontSize: 15, fontWeight: '700' },
  reviewComment: { marginTop: 6, color: palette.ink, fontSize: 13, lineHeight: 20 },
  reviewMeta: { marginTop: 10, color: palette.muted, fontSize: 11 },
});
