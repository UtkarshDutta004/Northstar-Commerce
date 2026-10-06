import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader.jsx';

export default function PrivateRoute() {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  if (loading) return <Loader label="Checking your account" />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
