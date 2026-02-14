import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policiesApi, clientsApi, carriersApi } from '../../api/client';
import { Card, DataTable, SearchInput, Button, Badge, Select, Spinner, Modal, Input, showToast } from '../../components/ui';
import { formatCurrency, policyTypeLabel } from '../../utils';
import { Plus, FileText } from 'lucide-react';
import { Policy, Client, Carrier } from '../../types';

export default function PolicyList() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ policy_number: '', client_id: '', carrier_id: '', type: 'general_liability', premium: '', deductible: '', coverage_limit: '', effective_date: '', expiration_date: '', description: '' });

  useEffect(() => {
    Promise.all([policiesApi.list(), clientsApi.list(), carriersApi.list()])
      .then(([p, c, ca]) => { setPolicies(p); setClients(c); setCarriers(ca); })
      .finally(() => setLoading(false));
  }, []);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));
  const carrierMap = Object.fromEntries(carriers.map(c => [c.id, c.name]));

  const filtered = policies.filter(p => {
    if (search && !p.policy_number.toLowerCase().includes(search.toLowerCase()) && !clientMap[p.client_id]?.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const handleAdd = async () => {
    try {
      await policiesApi.create({ ...form, client_id: Number(form.client_id), carrier_id: Number(form.carrier_id), premium: Number(form.premium), deductible: Number(form.deductible), coverage_limit: Number(form.coverage_limit) });
      showToast('Policy created successfully');
      setShowAdd(false);
      policiesApi.list().then(setPolicies);
    } catch { showToast('Failed to create policy', 'error'); }
  };

  if (loading) return <Spinner />;

  const typeOptions = [{ value: '', label: 'All Types' }, ...['general_liability', 'property', 'workers_comp', 'auto', 'umbrella', 'cyber', 'professional_liability', 'health'].map(t => ({ value: t, label: policyTypeLabel(t) }))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
          <p className="text-sm text-gray-500 mt-1">{policies.length} total policies</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add Policy</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} placeholder="Search policies..." /></div>
          <Select value={typeFilter} onChange={setTypeFilter} options={typeOptions} className="w-48" />
          <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'pending', label: 'Pending' }]} className="w-40" />
        </div>
      </Card>

      <Card>
        <DataTable
          data={filtered}
          onRowClick={(p) => navigate(`/policies/${p.id}`)}
          columns={[
            { key: 'policy_number', header: 'Policy #', render: (p) => <span className="font-medium text-lockton-navy">{p.policy_number}</span> },
            { key: 'client_id', header: 'Client', render: (p) => clientMap[p.client_id] || `#${p.client_id}` },
            { key: 'type', header: 'Type', render: (p) => policyTypeLabel(p.type) },
            { key: 'carrier_id', header: 'Carrier', render: (p) => p.carrier_id ? carrierMap[p.carrier_id] || `#${p.carrier_id}` : '—' },
            { key: 'premium', header: 'Premium', render: (p) => formatCurrency(p.premium) },
            { key: 'coverage_limit', header: 'Coverage', render: (p) => formatCurrency(p.coverage_limit) },
            { key: 'expiration_date', header: 'Expires', render: (p) => p.expiration_date || '—' },
            { key: 'status', header: 'Status', render: (p) => <Badge variant={p.status}>{p.status}</Badge> },
          ]}
        />
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Policy" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Policy Number" value={form.policy_number} onChange={v => setForm({ ...form, policy_number: v })} required />
          <Select label="Client" value={form.client_id} onChange={v => setForm({ ...form, client_id: v })} options={[{ value: '', label: 'Select Client' }, ...clients.map(c => ({ value: String(c.id), label: c.name }))]} />
          <Select label="Carrier" value={form.carrier_id} onChange={v => setForm({ ...form, carrier_id: v })} options={[{ value: '', label: 'Select Carrier' }, ...carriers.map(c => ({ value: String(c.id), label: c.name }))]} />
          <Select label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={typeOptions.slice(1)} />
          <Input label="Premium" type="number" value={form.premium} onChange={v => setForm({ ...form, premium: v })} />
          <Input label="Deductible" type="number" value={form.deductible} onChange={v => setForm({ ...form, deductible: v })} />
          <Input label="Coverage Limit" type="number" value={form.coverage_limit} onChange={v => setForm({ ...form, coverage_limit: v })} />
          <Input label="Effective Date" type="date" value={form.effective_date} onChange={v => setForm({ ...form, effective_date: v })} />
          <Input label="Expiration Date" type="date" value={form.expiration_date} onChange={v => setForm({ ...form, expiration_date: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Create Policy</Button>
        </div>
      </Modal>
    </div>
  );
}
