import { apiClient } from '@/api/client';
import type { Product } from '@/types';

function normalizeProduct(product: Product): Product {
  if (!product.imageUrl.startsWith('/')) return product;
  const apiBaseUrl = apiClient.defaults.baseURL ?? '';
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return {
    ...product,
    imageUrl: `${serverBaseUrl}${product.imageUrl}`,
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productService = {
  async list(filters: ProductFilters = {}): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products', { params: filters });
    return data.map(normalizeProduct);
  },
  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${encodeURIComponent(id)}`);
    return normalizeProduct(data);
  },
};
