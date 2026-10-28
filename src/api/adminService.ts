import { apiClient } from '@/api/client';
import { resolveImageUrl } from '@/utils/imageUrl';
import type { OrderStatus, UserProfile } from '@/types';

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  rating: number;
  created_at: string;
}

export type AdminUser = UserProfile;

export interface AdminOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: Record<string, string>;
  items: { id: string; productId: string; quantity: number; unitPrice: number }[];
  created_at: string;
  User?: Pick<AdminUser, 'id' | 'fullName' | 'email' | 'phone'>;
}

type ApiAdminOrder = Omit<AdminOrder, 'created_at'> & {
  createdAt: string;
  created_at?: string;
};

export interface AdminDashboard {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface ProductInput {
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  image?: { uri: string; name: string; type: string; file?: Blob };
}

function normalizeProduct(product: AdminProduct): AdminProduct {
  return {
    ...product,
    price: Number(product.price),
    rating: Number(product.rating),
    stock: Number(product.stock),
    imageUrl: resolveImageUrl(product.imageUrl) ?? '',
  };
}

function normalizeOrder(order: ApiAdminOrder): AdminOrder {
  return {
    ...order,
    created_at: order.createdAt ?? order.created_at ?? '',
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
  };
}

function productFormData(input: ProductInput): FormData {
  const body = new FormData();
  body.append('name', input.name);
  body.append('category', input.category);
  body.append('description', input.description);
  body.append('price', String(input.price));
  body.append('stock', String(input.stock));
  body.append('rating', String(input.rating));
  if (input.image) {
    if (input.image.file) {
      body.append('image', input.image.file, input.image.name);
    } else {
      body.append('image', input.image as unknown as Blob);
    }
  }
  return body;
}

export const adminService = {
  async dashboard(): Promise<AdminDashboard> {
    const { data } = await apiClient.get<AdminDashboard>('/admin/dashboard');
    return data;
  },
  async products(): Promise<AdminProduct[]> {
    const { data } = await apiClient.get<AdminProduct[]>('/admin/products');
    return data.map(normalizeProduct);
  },
  async product(id: string): Promise<AdminProduct> {
    const { data } = await apiClient.get<AdminProduct>(`/admin/products/${encodeURIComponent(id)}`);
    return normalizeProduct(data);
  },
  async createProduct(input: ProductInput): Promise<AdminProduct> {
    const { data } = await apiClient.post<AdminProduct>('/admin/products', productFormData(input), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeProduct(data);
  },
  async updateProduct(id: string, input: ProductInput): Promise<AdminProduct> {
    const { data } = await apiClient.put<AdminProduct>(
      `/admin/products/${encodeURIComponent(id)}`,
      productFormData(input),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return normalizeProduct(data);
  },
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${encodeURIComponent(id)}`);
  },
  async restockProduct(id: string, quantity: number): Promise<AdminProduct> {
    const { data } = await apiClient.put<AdminProduct>(
      `/admin/products/${encodeURIComponent(id)}/restock`,
      { quantity },
    );
    return normalizeProduct(data);
  },
  async users(): Promise<AdminUser[]> {
    const { data } = await apiClient.get<AdminUser[]>('/admin/users');
    return data;
  },
  async user(id: string): Promise<AdminUser> {
    const { data } = await apiClient.get<AdminUser>(`/admin/users/${encodeURIComponent(id)}`);
    return data;
  },
  async updateUserRole(id: string, role: 'customer' | 'admin'): Promise<AdminUser> {
    const { data } = await apiClient.put<AdminUser>(
      `/admin/users/${encodeURIComponent(id)}/role`,
      { role },
    );
    return data;
  },
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${encodeURIComponent(id)}`);
  },
  async orders(): Promise<AdminOrder[]> {
    const { data } = await apiClient.get<ApiAdminOrder[]>('/admin/orders');
    return data.map(normalizeOrder);
  },
  async order(id: string): Promise<AdminOrder> {
    const { data } = await apiClient.get<ApiAdminOrder>(`/admin/orders/${encodeURIComponent(id)}`);
    return normalizeOrder(data);
  },
  async updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
    const { data } = await apiClient.put<ApiAdminOrder>(
      `/admin/orders/${encodeURIComponent(id)}/status`,
      { status },
    );
    return normalizeOrder(data);
  },
};
