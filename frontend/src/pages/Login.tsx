import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Shield } from 'lucide-react';

const ROLE_LANDING: Record<string, string> = {
  admin: '/',
  broker: '/clients',
  analyst: '/analytics',
  client: '/policies',
};

const demoAccounts = [
  { label: 'Admin', email: 'admin@demo.com', password: 'Platform@Admin2024' },
  { label: 'Broker', email: 'broker@demo.com', password: 'Platform@Broker2024' },
  { label: 'Client', email: 'client@demo.com', password: 'Platform@Client2024' },
  { label: 'Analyst', email: 'analyst@demo.com', password: 'Platform@Analyst2024' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(ROLE_LANDING[user.role] ?? '/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lockton-navy-dark via-lockton-navy to-lockton-navy-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lockton-gold rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-lockton-navy-dark" />
          </div>
          <h1 className="text-3xl font-bold text-white">INSURANCE PLATFORM</h1>
          <p className="text-gray-300 mt-1">Insurance Management</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-lockton-navy focus:ring-2 focus:ring-lockton-navy/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-lockton-navy focus:ring-2 focus:ring-lockton-navy/20 outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lockton-navy text-white py-2.5 rounded-lg font-medium hover:bg-lockton-navy-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs font-medium text-gray-500 mb-3">DEMO ACCOUNTS</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="px-3 py-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
