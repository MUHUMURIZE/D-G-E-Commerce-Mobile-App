import { apiClient } from '@/api/client';
import { resolveImageUrl } from '@/utils/imageUrl';
import type { WishlistEntry } from '@/types';

interface ApiWishlistEntry extends Omit<WishlistEntry, 'Product'> {
  Product: WishlistEntry['Product'] & { stock?: number | string };
}

function normalizeEntry(entry: ApiWishlistEntry): WishlistEntry {
  const stock = Number(entry.Product.stock ?? 0);
  const { stock: _stock, ...product } = entry.Product;
  return {
    ...entry,
    Product: {
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
      imageUrl: resolveImageUrl(product.imageUrl) ?? '',
      availabilityStatus: stock <= 0 ? 'Out Of Stock' : stock <= 5 ? `Only ${stock} Left` : 'In Stock',
    },
  };
}

export const wishlistService = {
  async list(): Promise<WishlistEntry[]> {
    const { data } = await apiClient.get<ApiWishlistEntry[]>('/v2/wishlist');
    return data.map(normalizeEntry);
  },
  async add(productId: string): Promise<WishlistEntry> {
    const { data } = await apiClient.post<ApiWishlistEntry>('/v2/wishlist', { productId });
    return normalizeEntry(data);
  },
  async remove(productId: string): Promise<void> {
    await apiClient.delete(`/v2/wishlist/${encodeURIComponent(productId)}`);
  },
};
