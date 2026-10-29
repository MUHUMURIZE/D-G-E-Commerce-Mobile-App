import { apiClient } from '@/api/client';
import type { ProductReview, ProductReviews } from '@/types';

type ApiReview = Omit<ProductReview, 'created_at'> & { createdAt?: string; created_at?: string };

function normalizeReview(review: ApiReview): ProductReview {
  return { ...review, created_at: review.createdAt ?? review.created_at ?? '' };
}

export const reviewService = {
  async forProduct(productId: string): Promise<ProductReviews> {
    const { data } = await apiClient.get<ProductReviews>(`/v2/products/${encodeURIComponent(productId)}/reviews`);
    return {
      ...data,
      items: data.items.map(normalizeReview),
      currentReview: data.currentReview ? normalizeReview(data.currentReview) : null,
    };
  },
  async create(productId: string, input: { rating: number; title: string; comment: string }): Promise<ProductReview> {
    const { data } = await apiClient.post<ApiReview>(
      `/v2/products/${encodeURIComponent(productId)}/reviews`,
      input,
    );
    return normalizeReview(data);
  },
  async mine(): Promise<ProductReview[]> {
    const { data } = await apiClient.get<ApiReview[]>('/v2/reviews/me');
    return data.map(normalizeReview);
  },
  async adminList(status: 'all' | 'pending' | 'approved'): Promise<ProductReview[]> {
    const { data } = await apiClient.get<ApiReview[]>('/v2/admin/reviews', { params: { status } });
    return data.map(normalizeReview);
  },
  async approve(id: string): Promise<ProductReview> {
    const { data } = await apiClient.patch<ApiReview>(`/v2/admin/reviews/${encodeURIComponent(id)}/approve`);
    return normalizeReview(data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/v2/admin/reviews/${encodeURIComponent(id)}`);
  },
};
