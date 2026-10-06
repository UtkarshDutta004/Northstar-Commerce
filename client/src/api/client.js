import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('northstar-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem('northstar-token'));
      localStorage.removeItem('northstar-token');
      if (hadToken && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.dispatchEvent(new CustomEvent('northstar:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export const errorMessage = (error) => error.response?.data?.message || error.message || 'Something went wrong.';
export default api;
