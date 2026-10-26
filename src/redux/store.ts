import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import productReducer from '@/redux/slices/productSlice';
import cartReducer from '@/redux/slices/cartSlice';
import orderReducer from '@/redux/slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
