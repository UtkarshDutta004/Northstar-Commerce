import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/client.js';

const initialState = { user: null, loading: Boolean(localStorage.getItem('northstar-token')), error: null };

export const signIn = createAsyncThunk('auth/signIn', async (credentials, { rejectWithValue }) => {
  try {
    const data = (await api.post('/auth/login', credentials)).data;
    localStorage.setItem('northstar-token', data.token);
    return data;
  }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const signUp = createAsyncThunk('auth/signUp', async (details, { rejectWithValue }) => {
  try {
    const data = (await api.post('/auth/register', details)).data;
    localStorage.setItem('northstar-token', data.token);
    return data;
  }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try { return (await api.get('/auth/profile')).data.user; }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const saveProfile = createAsyncThunk('auth/saveProfile', async (profile, { rejectWithValue }) => {
  try { return (await api.patch('/auth/profile', profile)).data.user; }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut(state) { state.user = null; state.loading = false; state.error = null; },
    clearAuthError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signUp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signIn.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(signUp.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(fetchProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(saveProfile.fulfilled, (state, action) => { state.user = action.payload; })
      .addMatcher((action) => [signIn, signUp, fetchProfile].some((thunk) => thunk.rejected.match(action)), (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { signOut, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
