import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      if (action.payload.availabilityStatus === 'Out Of Stock') return;
      const existing = state.items.find((item) => item.product.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
    },
    setQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((entry) => entry.product.id === action.payload.productId);
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((entry) => entry.product.id !== action.payload.productId);
      } else {
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    clearCart: (state) => { state.items = []; },
  },
});

export const { addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export const selectCartTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);
export const selectCartCount = (items: CartItem[]) =>
  items.reduce((count, item) => count + item.quantity, 0);
export default cartSlice.reducer;
