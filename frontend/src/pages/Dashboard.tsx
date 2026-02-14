import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, FileText, AlertTriangle, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { analyticsApi } from '../api/client';
import { KPICard, Card, Badge, Spinner } from '../components/ui';
import { formatCurrency, formatNumber } from '../utils';

// ── Types ──

interface KPIs {
  total_clients: number;
  active_policies: number;
  pending_claims: number;
  total_premium_revenue: number;
  retention_rate: number;
  clients_trend?: { value: number; label: string };
  policies_trend?: { value: number; label: string };
  claims_trend?: { value: number; label: string };
  revenue_trend?: { value: number; label: string };
  retention_trend?: { value: number; label: string };
}

interface PolicyDistributionItem {
  name: string;
  value: number;
}

interface MonthlyPremiumItem {
  month: string;
  premium: number;
}

interface ClaimsByStatusItem {
  status: string;
  count: number;
}

interface RenewalPipelineItem {
  stage: string;
  count: number;
}

interface Alert {
  id: number;
  type: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
}

interface DashboardData {
  kpis: KPIs;
  policy_distribution: PolicyDistributionItem[];
  monthly_premiums: MonthlyPremiumItem[];
  claims_by_status: ClaimsByStatusItem[];
  renewal_pipeline: RenewalPipelineItem[];
  alerts: Alert[];
}

// ── Constants ──

const COLORS = ['#1B365D', '#2A4A7F', '#C8A951', '#E0C878', '#4A90D9', '#6BB3E0', '#34D399', '#FBBF24'];

const ALERT_STYLES: Record<Alert['type'], { bg: string; border: string; icon: string; text: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-800',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
};

// ── Custom Tooltip for Pie Chart ──

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200 text-sm">
      <p className="font-medium text-gray-900">{payload[0].name}</p>
      <p className="text-gray-600">{formatNumber(payload[0].value)} policies</p>
    </div>
  );
}

// ── Dashboard Component ──

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .dashboard()
      .then((res: DashboardData) => {
        if (!cancelled) setData(res);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
        <p className="text-sm text-gray-500">{error || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  const { kpis, policy_distribution, monthly_premiums, claims_by_status, renewal_pipeline, alerts } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your insurance operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Clients"
          value={formatNumber(kpis.total_clients)}
          icon={<Users className="w-5 h-5" />}
          trend={kpis.clients_trend}
        />
        <KPICard
          title="Active Policies"
          value={formatNumber(kpis.active_policies)}
          icon={<FileText className="w-5 h-5" />}
          trend={kpis.policies_trend}
        />
        <KPICard
          title="Pending Claims"
          value={formatNumber(kpis.pending_claims)}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={kpis.claims_trend}
        />
        <KPICard
          title="Total Premium Revenue"
          value={formatCurrency(kpis.total_premium_revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={kpis.revenue_trend}
        />
        <KPICard
          title="Retention Rate"
          value={`${kpis.retention_rate}%`}
          icon={<Shield className="w-5 h-5" />}
          trend={kpis.retention_trend}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Distribution - Pie Chart */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Policy Distribution</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={policy_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                  stroke="none"
                >
                  {policy_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Premium Trends - Line Chart */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Monthly Premium Trends</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly_premiums}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Premium']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="premium"
                  stroke="#1B365D"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#1B365D', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#1B365D', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Claims by Status - Bar Chart */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Claims by Status</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={claims_by_status}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), 'Claims']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#C8A951" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Renewal Pipeline - Horizontal Bar Chart */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Renewal Pipeline</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={renewal_pipeline} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), 'Renewals']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#1B365D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const style = ALERT_STYLES[alert.type];
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${style.bg} ${style.border}`}
                >
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${style.text}`}>{alert.title}</p>
                      <Badge variant={alert.type === 'danger' ? 'error' : alert.type === 'warning' ? 'pending' : 'filed'}>
                        {alert.type}
                      </Badge>
                    </div>
                    <p className={`mt-1 text-sm ${style.text} opacity-80`}>{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
