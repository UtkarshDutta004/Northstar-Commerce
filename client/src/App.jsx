import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import { fetchProfile, signOut } from './features/authSlice.js';
import HomePage from './pages/HomePage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function StoreLayout() {
  return <><Navbar /><Outlet /><Footer /></>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    if (localStorage.getItem('northstar-token')) dispatch(fetchProfile());
    const onUnauthorized = () => { localStorage.removeItem('northstar-token'); dispatch(signOut()); toast.error('Your session ended. Please sign in again.'); };
    window.addEventListener('northstar:unauthorized', onUnauthorized);
    return () => window.removeEventListener('northstar:unauthorized', onUnauthorized);
  }, [dispatch]);

  return <>
    <ScrollToTop />
    <Toaster position="top-right" toastOptions={{ duration: 3200, style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '2px' } }} />
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route element={<AdminRoute />}><Route path="admin" element={<AdminPage />} /></Route>
        </Route>
        <Route path="not-found" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </>;
}
