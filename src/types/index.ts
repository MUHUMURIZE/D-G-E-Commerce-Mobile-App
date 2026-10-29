export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount?: number;
  availabilityStatus: string;
  created_at?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved';
  created_at: string;
  User?: { id: string; fullName: string; email?: string };
  Product?: Pick<Product, 'id' | 'name' | 'imageUrl'>;
}

export interface ProductReviews {
  items: ProductReview[];
  canReview: boolean;
  currentReview: ProductReview | null;
}

export interface WishlistEntry {
  id: string;
  productId: string;
  Product: Product;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: string;
  entityId: string | null;
  readAt: string | null;
  created_at: string;
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
export type OrderStatus = 'Pending' | 'Confirmed' | 'Packing' | 'Shipped' | 'Delivered';

export interface OrderLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderLine[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string | null;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
