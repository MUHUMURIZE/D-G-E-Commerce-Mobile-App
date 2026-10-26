import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderService } from '@/api/orderService';
import type { Order } from '@/types';

interface OrderState {
  items: Order[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: OrderState = { items: [], loading: false, submitting: false, error: null };

export const fetchOrders = createAsyncThunk('orders/list', orderService.list);
export const submitOrder = createAsyncThunk('orders/place', orderService.place);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: { clearOrderError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Orders could not be loaded.';
      })
      .addCase(submitOrder.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.submitting = false;
        state.items.unshift(action.payload);
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message ?? 'Order could not be placed.';
      });
  },
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
