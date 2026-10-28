import { apiClient } from '@/api/client';
import type { Order, PaymentMethod, ShippingAddress, CartItem } from '@/types';

export interface PlaceOrderInput {
  items: CartItem[];
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
}

interface ApiOrder {
  id: string;
  userId: string;
  totalAmount: string | number;
  status: Order['status'];
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  items?: {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: string | number;
  }[];
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

function normalizeOrder(order: ApiOrder): Order {
  return {
    ...order,
    created_at: order.createdAt ?? order.created_at ?? '',
    totalAmount: Number(order.totalAmount),
    items: (order.items ?? []).map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
  };
}

export const orderService = {
  async list(): Promise<Order[]> {
    const { data } = await apiClient.get<ApiOrder[]>('/orders');
    return data.map(normalizeOrder);
  },
  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<ApiOrder>(`/orders/${encodeURIComponent(id)}`);
    return normalizeOrder(data);
  },
  async place(input: PlaceOrderInput): Promise<Order> {
    const { data } = await apiClient.post<ApiOrder>('/orders', {
      items: input.items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      address: input.address,
      paymentMethod: input.paymentMethod,
    });
    return normalizeOrder(data);
  },
};
