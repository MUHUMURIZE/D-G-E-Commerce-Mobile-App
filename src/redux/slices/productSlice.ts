import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productService, type ProductFilters } from '@/api/productService';
import { DEMO_PRODUCTS } from '@/constants/products';
import type { Product } from '@/types';

interface ProductState {
  items: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

const initialState: ProductState = {
  items: DEMO_PRODUCTS,
  loading: false,
  error: null,
  filters: {},
};

export const refreshProducts = createAsyncThunk('products/refresh', productService.list);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: { payload: ProductFilters }) => { state.filters = action.payload; },
    clearFilters: (state) => { state.filters = {}; },
    clearProductError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(refreshProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(refreshProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Products could not be refreshed.';
      });
  },
});

export const { setFilters, clearFilters, clearProductError } = productSlice.actions;
export default productSlice.reducer;
