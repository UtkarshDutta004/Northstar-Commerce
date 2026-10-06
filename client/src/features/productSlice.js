import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/client.js';

export const fetchProducts = createAsyncThunk('products/list', async (params = {}, { rejectWithValue }) => {
  try { return (await api.get('/products', { params })).data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try { return (await api.get('/products/categories')).data.categories; }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const fetchProduct = createAsyncThunk('products/detail', async (slug, { rejectWithValue }) => {
  try { return (await api.get(`/products/${slug}`)).data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], categories: [], current: null, reviews: [], page: 1, pages: 1, total: 0, loading: false, error: null },
  reducers: { clearCurrent(state) { state.current = null; state.reviews = []; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.current = action.payload.product; state.reviews = action.payload.reviews; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearCurrent } = productSlice.actions;
export default productSlice.reducer;
