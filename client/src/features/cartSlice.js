import { createSlice } from '@reduxjs/toolkit';

function readCart() {
  try { return JSON.parse(localStorage.getItem('northstar-cart') || '[]'); }
  catch { return []; }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: readCart() },
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const existing = state.items.find((entry) => entry.productId === item.productId);
      if (existing) existing.quantity = Math.min(existing.quantity + item.quantity, item.stock);
      else state.items.push(item);
    },
    setQuantity(state, action) {
      const item = state.items.find((entry) => entry.productId === action.payload.productId);
      if (item) item.quantity = Math.max(1, Math.min(Number(action.payload.quantity), item.stock));
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    clearCart(state) { state.items = []; },
  },
});

export const { addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
