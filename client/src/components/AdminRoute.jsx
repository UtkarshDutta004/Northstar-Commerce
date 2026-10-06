import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader.jsx';

export default function AdminRoute() {
  const { user, loading } = useSelector((state) => state.auth);
  if (loading) return <Loader label="Checking permissions" />;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to={user ? '/' : '/login'} replace />;
}
