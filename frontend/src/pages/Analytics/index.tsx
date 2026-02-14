import { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/client';
import { Card, Spinner, Select } from '../../components/ui';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1B365D', '#2A4A7F', '#C8A951', '#E0C878', '#4A90D9', '#6BB3E0', '#34D399', '#FBBF24'];

export default function AnalyticsPage() {
  const [lossRatio, setLossRatio] = useState<any[]>([]);
  const [brokerProd, setBrokerProd] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      analyticsApi.dashboard(),
      analyticsApi.lossRatio(),
      analyticsApi.brokerProductivity(),
      analyticsApi.revenueForecast(),
    ]).then(([d, lr, bp, rf]) => {
      setDashboard(d); setLossRatio(lr); setBrokerProd(bp); setForecast(rf);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'loss', label: 'Loss Ratio' },
    { key: 'broker', label: 'Broker Productivity' },
    { key: 'revenue', label: 'Revenue Forecast' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Business Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">Interactive dashboards and reporting</p>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.key ? 'bg-lockton-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Policy Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dashboard.policy_distribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={({ type, count }: any) => `${type.replace('_', ' ')} (${count})`}>
                  {dashboard.policy_distribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Premium Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard.monthly_premiums}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                <Line type="monotone" dataKey="premium" stroke="#1B365D" strokeWidth={2} dot={{ fill: '#C8A951' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Claims by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.claims_by_status}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#C8A951" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Renewal Pipeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.renewal_pipeline} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B365D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'loss' && (
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Loss Ratio by Industry</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={lossRatio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="premiums" fill="#1B365D" name="Premiums" radius={[4, 4, 0, 0]} />
                <Bar dataKey="claims_paid" fill="#C8A951" name="Claims Paid" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Loss Ratio % by Industry</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lossRatio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" tick={{ fontSize: 11 }} />
                <YAxis unit="%" />
                <Tooltip formatter={(val: number) => `${val}%`} />
                <Bar dataKey="loss_ratio" fill="#2A4A7F" radius={[4, 4, 0, 0]}>
                  {lossRatio.map((entry, i) => <Cell key={i} fill={entry.loss_ratio > 70 ? '#EF4444' : entry.loss_ratio > 50 ? '#F59E0B' : '#10B981'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'broker' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Broker Productivity — Clients & Policies</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={brokerProd}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="broker_name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clients" fill="#1B365D" name="Clients" radius={[4, 4, 0, 0]} />
                <Bar dataKey="policies" fill="#C8A951" name="Policies" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Broker Premium Volume</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={brokerProd}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="broker_name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                <Bar dataKey="total_premium" fill="#2A4A7F" name="Total Premium" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'revenue' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">12-Month Revenue Forecast</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
              <Line type="monotone" dataKey="projected_revenue" stroke="#1B365D" strokeWidth={2} dot={{ fill: '#C8A951', r: 4 }} name="Projected Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
