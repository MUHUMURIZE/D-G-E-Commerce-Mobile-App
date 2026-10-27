import { combineReducers, configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import productReducer from '@/redux/slices/productSlice';
import cartReducer, {
  addProductQuantity,
  addToCart,
  cartSyncCompleted,
  cartSyncFailed,
  cartSyncStarted,
  clearCart,
  removeFromCart,
  setQuantity,
} from '@/redux/slices/cartSlice';
import orderReducer from '@/redux/slices/orderSlice';
import { cartService } from '@/api/cartService';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  orders: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const cartSyncListener = createListenerMiddleware<RootState>();

cartSyncListener.startListening({
  matcher: isAnyOf(addToCart, addProductQuantity, setQuantity, removeFromCart, clearCart),
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(250);
    listenerApi.dispatch(cartSyncStarted());

    try {
      if (clearCart.match(action)) {
        await cartService.clear(listenerApi.signal);
      } else {
        await cartService.sync(listenerApi.getState().cart.items, listenerApi.signal);
      }
      if (listenerApi.signal.aborted) return;
      listenerApi.dispatch(cartSyncCompleted());
    } catch (error) {
      if (listenerApi.signal.aborted) return;
      listenerApi.dispatch(cartSyncFailed(error instanceof Error ? error.message : String(error)));
    }
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(cartSyncListener.middleware),
});

export type AppDispatch = typeof store.dispatch;
