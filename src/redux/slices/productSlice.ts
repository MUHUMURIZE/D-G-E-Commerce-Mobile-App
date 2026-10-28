import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productService, type ProductFilters } from '@/api/productService';
import type { RootState } from '@/redux/store';
import type { Product } from '@/types';

interface ProductState {
  items: Product[];
  loading: boolean;
  hasLoaded: boolean;
  requestInFlight: boolean;
  error: string | null;
  filters: ProductFilters;
}

const initialState: ProductState = {
  items: [],
  loading: true,
  hasLoaded: false,
  requestInFlight: false,
  error: null,
  filters: {},
};

export const refreshProducts = createAsyncThunk<
  Product[],
  ProductFilters & { force?: boolean },
  { state: RootState }
>(
  'products/refresh',
  (request: ProductFilters & { force?: boolean }) => {
    const filters = { ...request };
    delete filters.force;
    return productService.list(filters);
  },
  {
    condition: ({ force }, { getState }) => {
      const { hasLoaded, requestInFlight } = getState().products;
      return !requestInFlight && (force === true || !hasLoaded);
    },
  },
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: { payload: ProductFilters }) => { state.filters = action.payload; },
    clearFilters: (state) => { state.filters = {}; },
    clearProductError: (state) => { state.error = null; },
    removeProduct: (state, action: { payload: string }) => {
      state.items = state.items.filter((product) => product.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshProducts.pending, (state) => {
        state.loading = true;
        state.requestInFlight = true;
        state.error = null;
      })
      .addCase(refreshProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        state.requestInFlight = false;
        state.items = action.payload;
      })
      .addCase(refreshProducts.rejected, (state, action) => {
        state.loading = false;
        state.requestInFlight = false;
        state.error = action.error.message ?? 'Products could not be refreshed.';
      });
  },
});

export const { setFilters, clearFilters, clearProductError, removeProduct } = productSlice.actions;
export default productSlice.reducer;
