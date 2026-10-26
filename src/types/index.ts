export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  availabilityStatus: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  sector: string;
  street: string;
}

export type PaymentMethod = 'mobile_money' | 'card' | 'cash_on_delivery';
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
