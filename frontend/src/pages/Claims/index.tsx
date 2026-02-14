import { useState, useEffect } from 'react';
import { claimsApi, clientsApi } from '../../api/client';
import { Card, DataTable, SearchInput, Button, Badge, Select, Spinner, Modal, Input, Textarea, KPICard, showToast } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils';
import { Plus, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Claim, Client } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Claim | null>(null);
  const [form, setForm] = useState({ claim_number: '', policy_id: '', client_id: '', type: 'property_damage', amount_claimed: '', description: '' });

  useEffect(() => {
    Promise.all([claimsApi.list(), clientsApi.list(), claimsApi.analytics()])
      .then(([c, cl, a]) => { setClaims(c); setClients(cl); setAnalytics(a); })
      .finally(() => setLoading(false));
  }, []);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));

  const filtered = claims.filter(c => {
    if (search && !c.claim_number.toLowerCase().includes(search.toLowerCase()) && !clientMap[c.client_id]?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const handleAdd = async () => {
    try {
      await claimsApi.create({ ...form, policy_id: Number(form.policy_id), client_id: Number(form.client_id), amount_claimed: Number(form.amount_claimed) });
      showToast('Claim filed successfully');
      setShowAdd(false);
      claimsApi.list().then(setClaims);
    } catch { showToast('Failed to file claim', 'error'); }
  };

  const updateStatus = async (claim: Claim, newStatus: string) => {
    try {
      await claimsApi.update(claim.id, { status: newStatus });
      showToast(`Claim ${newStatus.replace('_', ' ')}`);
      claimsApi.list().then(setClaims);
      setShowDetail(null);
    } catch { showToast('Update failed', 'error'); }
  };

  const statusCounts = claims.reduce((acc: Record<string, number>, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({ status: status.replace('_', ' '), count }));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-sm text-gray-500 mt-1">{claims.length} total claims</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />File Claim</Button>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <KPICard title="Total Claims" value={analytics.total_claims} icon={<AlertTriangle className="w-5 h-5" />} />
          <KPICard title="Approval Rate" value={`${analytics.approval_rate}%`} icon={<CheckCircle className="w-5 h-5" />} />
          <KPICard title="Avg Cycle Time" value={`${analytics.average_cycle_time_days} days`} icon={<Clock className="w-5 h-5" />} />
          <KPICard title="Avg Claim Amount" value={formatCurrency(analytics.average_claim_amount)} icon={<DollarSign className="w-5 h-5" />} />
          <KPICard title="Total Paid" value={formatCurrency(analytics.total_paid)} icon={<DollarSign className="w-5 h-5" />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Claims by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1B365D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Status Pipeline</h3>
          <div className="space-y-3">
            {['filed', 'under_review', 'approved', 'denied', 'paid', 'closed'].map(s => (
              <div key={s} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={s}>{s.replace('_', ' ')}</Badge>
                </div>
                <span className="text-sm font-bold text-gray-900">{statusCounts[s] || 0}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} placeholder="Search claims..." /></div>
          <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: '', label: 'All Status' }, ...['filed', 'under_review', 'approved', 'denied', 'paid', 'closed'].map(s => ({ value: s, label: s.replace('_', ' ') }))]} className="w-44" />
        </div>
      </Card>

      <Card>
        <DataTable
          data={filtered}
          onRowClick={setShowDetail}
          columns={[
            { key: 'claim_number', header: 'Claim #', render: (c) => <span className="font-medium text-lockton-navy">{c.claim_number}</span> },
            { key: 'client_id', header: 'Client', render: (c) => clientMap[c.client_id] || `#${c.client_id}` },
            { key: 'type', header: 'Type', render: (c) => (c.type || '').replace('_', ' ') },
            { key: 'amount_claimed', header: 'Claimed', render: (c) => formatCurrency(c.amount_claimed) },
            { key: 'amount_paid', header: 'Paid', render: (c) => formatCurrency(c.amount_paid) },
            { key: 'date_filed', header: 'Filed', render: (c) => formatDate(c.date_filed) },
            { key: 'fraud_risk_score', header: 'Fraud Risk', render: (c) => <Badge variant={c.fraud_risk_score > 50 ? 'high' : c.fraud_risk_score > 25 ? 'medium' : 'low'}>{c.fraud_risk_score}</Badge> },
            { key: 'status', header: 'Status', render: (c) => <Badge variant={c.status}>{c.status.replace('_', ' ')}</Badge> },
          ]}
        />
      </Card>

      {/* Claim Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={`Claim ${showDetail?.claim_number}`} size="lg">
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Status</p><Badge variant={showDetail.status}>{showDetail.status.replace('_', ' ')}</Badge></div>
              <div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium">{(showDetail.type || '').replace('_', ' ')}</p></div>
              <div><p className="text-xs text-gray-500">Amount Claimed</p><p className="text-sm font-medium">{formatCurrency(showDetail.amount_claimed)}</p></div>
              <div><p className="text-xs text-gray-500">Amount Approved</p><p className="text-sm font-medium">{formatCurrency(showDetail.amount_approved)}</p></div>
              <div><p className="text-xs text-gray-500">Date Filed</p><p className="text-sm font-medium">{formatDate(showDetail.date_filed)}</p></div>
              <div><p className="text-xs text-gray-500">Date of Loss</p><p className="text-sm font-medium">{formatDate(showDetail.date_of_loss)}</p></div>
              <div><p className="text-xs text-gray-500">Fraud Risk Score</p><Badge variant={showDetail.fraud_risk_score > 50 ? 'high' : showDetail.fraud_risk_score > 25 ? 'medium' : 'low'}>{showDetail.fraud_risk_score}/100</Badge></div>
              <div><p className="text-xs text-gray-500">Client</p><p className="text-sm font-medium">{clientMap[showDetail.client_id] || `#${showDetail.client_id}`}</p></div>
            </div>
            {showDetail.description && <div><p className="text-xs text-gray-500">Description</p><p className="text-sm">{showDetail.description}</p></div>}

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {showDetail.status === 'filed' && <Button size="sm" onClick={() => updateStatus(showDetail, 'under_review')}>Start Review</Button>}
                {showDetail.status === 'under_review' && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(showDetail, 'approved')}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => updateStatus(showDetail, 'denied')}>Deny</Button>
                  </>
                )}
                {showDetail.status === 'approved' && <Button size="sm" onClick={() => updateStatus(showDetail, 'paid')}>Mark Paid</Button>}
                {['paid', 'denied'].includes(showDetail.status) && <Button size="sm" variant="secondary" onClick={() => updateStatus(showDetail, 'closed')}>Close</Button>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* File Claim Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="File New Claim" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Claim Number" value={form.claim_number} onChange={v => setForm({ ...form, claim_number: v })} placeholder="CLM-XXXXXX" />
          <Input label="Policy ID" type="number" value={form.policy_id} onChange={v => setForm({ ...form, policy_id: v })} />
          <Select label="Client" value={form.client_id} onChange={v => setForm({ ...form, client_id: v })} options={[{ value: '', label: 'Select Client' }, ...clients.map(c => ({ value: String(c.id), label: c.name }))]} />
          <Select label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={[{ value: 'property_damage', label: 'Property Damage' }, { value: 'bodily_injury', label: 'Bodily Injury' }, { value: 'theft', label: 'Theft' }, { value: 'liability', label: 'Liability' }, { value: 'natural_disaster', label: 'Natural Disaster' }]} />
          <Input label="Amount Claimed" type="number" value={form.amount_claimed} onChange={v => setForm({ ...form, amount_claimed: v })} />
        </div>
        <Textarea label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd}>File Claim</Button>
        </div>
      </Modal>
    </div>
  );
}
