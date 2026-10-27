import { apiClient } from '@/api/client';
import type { CartItem } from '@/types';

export const cartService = {
  async sync(items: CartItem[], signal?: AbortSignal): Promise<void> {
    await apiClient.put('/cart', { items }, { signal });
  },
  async clear(signal?: AbortSignal): Promise<void> {
    await apiClient.delete('/cart', { signal });
  },
};
