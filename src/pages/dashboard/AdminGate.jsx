import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLogin from './AdminLogin';

export default function AdminGate() {
  const { role } = useAuth();
  if (role === 'admin') return <Outlet />;
  return <AdminLogin />;
}