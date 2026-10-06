import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice.js';
import cartReducer from '../features/cartSlice.js';
import productReducer from '../features/productSlice.js';

export const store = configureStore({
  reducer: { auth: authReducer, cart: cartReducer, products: productReducer },
});

store.subscribe(() => {
  try {
    localStorage.setItem('northstar-cart', JSON.stringify(store.getState().cart.items));
  } catch {
    // Cart state remains usable for the current session if storage is unavailable.
  }
});
