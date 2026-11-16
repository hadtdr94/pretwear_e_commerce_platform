import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

export default function AdminGuard() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Loading admin...</div>;
  if (!isAuthenticated || !['ADMIN', 'MANAGER'].includes(user?.role)) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout />;
}
