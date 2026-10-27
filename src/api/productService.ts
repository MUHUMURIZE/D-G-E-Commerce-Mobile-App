import { apiClient } from '@/api/client';
import { resolveImageUrl } from '@/utils/imageUrl';
import type { Product } from '@/types';

interface ApiProduct extends Omit<Product, 'price' | 'rating' | 'imageUrl' | 'availabilityStatus'> {
  price: number | string;
  rating: number | string;
  imageUrl?: string | null;
  availabilityStatus?: string;
  stock?: number | string;
}

interface ProductListResponse {
  items: ApiProduct[];
  pages?: number;
}

function availabilityFromStock(stock: number): string {
  if (stock <= 0) return 'Out Of Stock';
  return stock <= 5 ? `Only ${stock} Left` : 'In Stock';
}

function normalizeProduct(product: ApiProduct): Product {
  const { stock: rawStock, ...customerProduct } = product;
  const stock = rawStock === undefined ? undefined : Number(rawStock);
  return {
    ...customerProduct,
    price: Number(product.price),
    rating: Number(product.rating),
    imageUrl: resolveImageUrl(product.imageUrl) ?? '',
    availabilityStatus: product.availabilityStatus
      ?? (stock === undefined ? 'Out Of Stock' : availabilityFromStock(stock)),
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
    const pageSize = 100;
    const products: ApiProduct[] = [];
    const productIds = new Set<string>();
    let page = 1;

    while (true) {
      const { data } = await apiClient.get<ProductListResponse | ApiProduct[]>('/products', {
        params: { ...filters, page, limit: pageSize },
      });
      const pageItems = Array.isArray(data) ? data : data.items;
      const newProducts = pageItems.filter((product) => !productIds.has(product.id));
      newProducts.forEach((product) => productIds.add(product.id));
      products.push(...newProducts);

      const hasMorePages = Array.isArray(data)
        ? pageItems.length === pageSize && newProducts.length > 0
        : page < (data.pages ?? page);
      if (!hasMorePages) break;
      page += 1;
    }

    return products.map(normalizeProduct);
  },
  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<ApiProduct>(`/products/${encodeURIComponent(id)}`);
    return normalizeProduct(data);
  },
};
