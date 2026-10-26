import { apiClient } from '@/api/client';
import type { CartItem } from '@/types';

export const cartService = {
  async sync(items: CartItem[]): Promise<void> {
    await apiClient.put('/cart', { items });
  },
  async clear(): Promise<void> {
    await apiClient.delete('/cart');
  },
};
