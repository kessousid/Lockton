import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../../api/client';
import { Card, DataTable, SearchInput, Button, Badge, Select, Spinner, Modal, Input, showToast } from '../../components/ui';
import { formatCurrency, statusColor } from '../../utils';
import { Plus, Users } from 'lucide-react';
import type { Client } from '../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
];

const INDUSTRY_OPTIONS = [
  { value: '', label: 'All Industries' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Media', label: 'Media' },
  { value: 'Retail', label: 'Retail' },
];

const INITIAL_FORM = {
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  industry: '',
  company_size: '',
};

export default function ClientList() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      const data = await clientsApi.list();
      setClients(data);
    } catch (err) {
      showToast('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filtered = clients.filter((c) => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesIndustry = !industryFilter || c.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const columns = [
    { key: 'name', header: 'Client Name' },
    { key: 'contact_name', header: 'Contact' },
    { key: 'industry', header: 'Industry' },
    {
      key: 'status',
      header: 'Status',
      render: (item: Client) => (
        <Badge variant={item.status}>{item.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</Badge>
      ),
    },
    {
      key: 'retention_risk',
      header: 'Retention Risk',
      render: (item: Client) => (
        <Badge variant={item.retention_risk}>{item.retention_risk.replace(/\b\w/g, (l) => l.toUpperCase())}</Badge>
      ),
    },
    {
      key: 'annual_revenue',
      header: 'Annual Revenue',
      render: (item: Client) => (item.annual_revenue != null ? formatCurrency(item.annual_revenue) : '—'),
    },
  ];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setSubmitting(true);
      await clientsApi.create({
        name: form.name,
        contact_name: form.contact_name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        industry: form.industry || undefined,
        company_size: form.company_size || undefined,
      });
      showToast('Client created successfully');
      setShowAddModal(false);
      setForm(INITIAL_FORM);
      fetchClients();
    } catch (err) {
      showToast('Failed to create client', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-lockton-navy" />
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search clients..." />
          <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <Select value={industryFilter} onChange={setIndustryFilter} options={INDUSTRY_OPTIONS} />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <DataTable<Client>
          columns={columns}
          data={filtered}
          onRowClick={(item) => navigate(`/clients/${item.id}`)}
        />
      </Card>

      {/* Add Client Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Client" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Company Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Enter company name"
            required
          />
          <Input
            label="Contact Name"
            value={form.contact_name}
            onChange={(v) => setForm({ ...form, contact_name: v })}
            placeholder="Primary contact name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="contact@example.com"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Industry"
              value={form.industry}
              onChange={(v) => setForm({ ...form, industry: v })}
              options={INDUSTRY_OPTIONS}
            />
            <Input
              label="Company Size"
              value={form.company_size}
              onChange={(v) => setForm({ ...form, company_size: v })}
              placeholder="e.g. 50-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
