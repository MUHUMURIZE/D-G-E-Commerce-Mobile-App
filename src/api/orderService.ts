import { apiClient } from '@/api/client';
import type { Order, PaymentMethod, ShippingAddress, CartItem } from '@/types';

export interface PlaceOrderInput {
  items: CartItem[];
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export const orderService = {
  async list(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },
  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${encodeURIComponent(id)}`);
    return data;
  },
  async place(input: PlaceOrderInput): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders', input);
    return data;
  },
};
