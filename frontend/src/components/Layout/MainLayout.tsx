import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { Spinner } from '../ui';

export default function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
