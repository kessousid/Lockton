import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi, policiesApi, claimsApi } from '../../api/client';
import { Card, Badge, Button, DataTable, Spinner, KPICard, Modal, Input, Select, Textarea, showToast } from '../../components/ui';
import { formatCurrency, formatDate, policyTypeLabel } from '../../utils';
import { ArrowLeft, Edit, DollarSign, Shield, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { Policy, Claim, Client } from '../../types';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    const cid = Number(id);
    Promise.all([
      clientsApi.get(cid),
      clientsApi.summary(cid),
      policiesApi.list({ client_id: String(cid) }),
      claimsApi.list({ client_id: String(cid) }),
    ]).then(([c, s, p, cl]) => {
      setClient(c); setSummary(s); setPolicies(p); setClaims(cl);
      setForm({ name: c.name, contact_name: c.contact_name || '', email: c.email || '', phone: c.phone || '', industry: c.industry || '', company_size: c.company_size || '', notes: c.notes || '' });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!client) return;
    try {
      const updated = await clientsApi.update(client.id, form);
      setClient(updated);
      showToast('Client updated');
      setShowEdit(false);
    } catch { showToast('Update failed', 'error'); }
  };

  if (loading || !client) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/clients')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500">{client.industry} · {client.city}, {client.state}</p>
          </div>
          <Badge variant={client.status}>{client.status}</Badge>
          <Badge variant={client.retention_risk}>Risk: {client.retention_risk}</Badge>
        </div>
        <Button onClick={() => setShowEdit(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Policies" value={summary?.total_policies || 0} icon={<FileText className="w-5 h-5" />} />
        <KPICard title="Active Premium" value={formatCurrency(summary?.total_premium || 0)} icon={<DollarSign className="w-5 h-5" />} />
        <KPICard title="Total Claims" value={summary?.total_claims || 0} icon={<AlertTriangle className="w-5 h-5" />} />
        <KPICard title="Loss Ratio" value={`${summary?.loss_ratio || 0}%`} icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
          <dl className="space-y-3">
            {[
              ['Contact', client.contact_name],
              ['Email', client.email],
              ['Phone', client.phone],
              ['Address', client.address],
              ['City/State', `${client.city || ''}, ${client.state || ''} ${client.zip_code || ''}`],
              ['Company Size', client.company_size],
              ['Revenue', formatCurrency(client.annual_revenue || 0)],
              ['Risk Score', `${client.risk_score}/100`],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex justify-between">
                <dt className="text-sm text-gray-500">{label}</dt>
                <dd className="text-sm font-medium text-gray-900 text-right">{val || '—'}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Cross-Sell Opportunities</h3>
          {summary?.cross_sell_opportunities?.length > 0 ? (
            <div className="space-y-3">
              {summary.cross_sell_opportunities.map((opp: any) => (
                <div key={opp.type} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{policyTypeLabel(opp.type)}</p>
                    <p className="text-xs text-blue-700 mt-0.5">{opp.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No opportunities identified</p>}
        </Card>
      </div>

      <Card>
        <div className="px-6 py-4 border-b"><h3 className="font-semibold text-gray-900">Policies ({policies.length})</h3></div>
        <DataTable
          data={policies}
          onRowClick={(p) => navigate(`/policies/${p.id}`)}
          columns={[
            { key: 'policy_number', header: 'Policy #', render: (p) => <span className="font-medium text-lockton-navy">{p.policy_number}</span> },
            { key: 'type', header: 'Type', render: (p) => policyTypeLabel(p.type) },
            { key: 'premium', header: 'Premium', render: (p) => formatCurrency(p.premium) },
            { key: 'coverage_limit', header: 'Coverage', render: (p) => formatCurrency(p.coverage_limit) },
            { key: 'expiration_date', header: 'Expires', render: (p) => formatDate(p.expiration_date) },
            { key: 'status', header: 'Status', render: (p) => <Badge variant={p.status}>{p.status}</Badge> },
          ]}
        />
      </Card>

      {claims.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b"><h3 className="font-semibold text-gray-900">Claims History ({claims.length})</h3></div>
          <DataTable
            data={claims}
            columns={[
              { key: 'claim_number', header: 'Claim #', render: (c) => <span className="font-medium">{c.claim_number}</span> },
              { key: 'type', header: 'Type', render: (c) => c.type?.replace('_', ' ') || '—' },
              { key: 'amount_claimed', header: 'Claimed', render: (c) => formatCurrency(c.amount_claimed) },
              { key: 'amount_paid', header: 'Paid', render: (c) => formatCurrency(c.amount_paid) },
              { key: 'date_filed', header: 'Filed', render: (c) => formatDate(c.date_filed) },
              { key: 'status', header: 'Status', render: (c) => <Badge variant={c.status}>{c.status.replace('_', ' ')}</Badge> },
            ]}
          />
        </Card>
      )}

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Client" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.name || ''} onChange={v => setForm({ ...form, name: v })} />
          <Input label="Contact Name" value={form.contact_name || ''} onChange={v => setForm({ ...form, contact_name: v })} />
          <Input label="Email" value={form.email || ''} onChange={v => setForm({ ...form, email: v })} />
          <Input label="Phone" value={form.phone || ''} onChange={v => setForm({ ...form, phone: v })} />
          <Input label="Industry" value={form.industry || ''} onChange={v => setForm({ ...form, industry: v })} />
          <Select label="Company Size" value={form.company_size || ''} onChange={v => setForm({ ...form, company_size: v })} options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'enterprise', label: 'Enterprise' }]} />
        </div>
        <Textarea label="Notes" value={form.notes || ''} onChange={v => setForm({ ...form, notes: v })} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}
