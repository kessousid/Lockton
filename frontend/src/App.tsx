import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ToastContainer } from './components/ui';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { ClientList, ClientDetail } from './pages/Clients';
import { PolicyList, PolicyDetail } from './pages/Policies';
import ClaimsPage from './pages/Claims';
import RenewalsPage from './pages/Renewals';
import CarriersPage from './pages/Carriers';
import CertificatesPage from './pages/Certificates';
import AnalyticsPage from './pages/Analytics';
import DocumentsPage from './pages/Documents';
import WorkflowsPage from './pages/Workflows';
import AIAssistant from './pages/AI';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/policies" element={<PolicyList />} />
            <Route path="/policies/:id" element={<PolicyDetail />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/claims/:id" element={<ClaimsPage />} />
            <Route path="/renewals" element={<RenewalsPage />} />
            <Route path="/carriers" element={<CarriersPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AuthProvider>
  );
}
