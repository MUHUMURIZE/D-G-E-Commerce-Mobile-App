import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '@/types';
import { getAvailableQuantity } from '@/utils/inventory';

interface CartState {
  items: CartItem[];
  syncing: boolean;
  syncError: string | null;
}

const initialState: CartState = { items: [], syncing: false, syncError: null };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const availableQuantity = getAvailableQuantity(action.payload.availabilityStatus);
      if (availableQuantity === 0) return;
      const existing = state.items.find((item) => item.product.id === action.payload.id);
      if (existing) {
        if (availableQuantity !== undefined && existing.quantity >= availableQuantity) return;
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
        const availableQuantity = getAvailableQuantity(item.product.availabilityStatus);
        if (availableQuantity !== undefined && action.payload.quantity > availableQuantity) return;
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    clearCart: (state) => { state.items = []; },
    cartSyncStarted: (state) => { state.syncing = true; state.syncError = null; },
    cartSyncCompleted: (state) => { state.syncing = false; state.syncError = null; },
    cartSyncFailed: (state, action: PayloadAction<string>) => {
      state.syncing = false;
      state.syncError = action.payload;
    },
    clearCartSyncError: (state) => { state.syncError = null; },
  },
});

export const {
  addToCart,
  setQuantity,
  removeFromCart,
  clearCart,
  cartSyncStarted,
  cartSyncCompleted,
  cartSyncFailed,
  clearCartSyncError,
} = cartSlice.actions;
export const selectCartTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);
export const selectCartCount = (items: CartItem[]) =>
  items.reduce((count, item) => count + item.quantity, 0);
export default cartSlice.reducer;
