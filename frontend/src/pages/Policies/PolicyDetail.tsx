import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { policiesApi, clientsApi, carriersApi, claimsApi } from '../../api/client';
import { Card, Badge, Button, DataTable, Spinner, KPICard, Modal, Input, Select, showToast } from '../../components/ui';
import { formatCurrency, formatDate, policyTypeLabel } from '../../utils';
import { ArrowLeft, Edit, DollarSign, Shield, Calendar, FileText } from 'lucide-react';
import { Policy, Client, Carrier, Claim } from '../../types';

export default function PolicyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    policiesApi.get(Number(id)).then(async (p) => {
      setPolicy(p);
      setForm({ premium: String(p.premium), deductible: String(p.deductible), coverage_limit: String(p.coverage_limit), status: p.status });
      if (p.client_id) clientsApi.get(p.client_id).then(setClient).catch(() => {});
      if (p.carrier_id) carriersApi.get(p.carrier_id).then(setCarrier).catch(() => {});
      claimsApi.list({ policy_id: String(p.id) }).then(setClaims).catch(() => {});
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!policy) return;
    try {
      const updated = await policiesApi.update(policy.id, { premium: Number(form.premium), deductible: Number(form.deductible), coverage_limit: Number(form.coverage_limit), status: form.status });
      setPolicy(updated);
      showToast('Policy updated');
      setShowEdit(false);
    } catch { showToast('Update failed', 'error'); }
  };

  if (loading || !policy) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/policies')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{policy.policy_number}</h1>
            <p className="text-sm text-gray-500">{policyTypeLabel(policy.type)} {client ? `— ${client.name}` : ''}</p>
          </div>
          <Badge variant={policy.status}>{policy.status}</Badge>
        </div>
        <Button onClick={() => setShowEdit(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Premium" value={formatCurrency(policy.premium)} icon={<DollarSign className="w-5 h-5" />} />
        <KPICard title="Deductible" value={formatCurrency(policy.deductible)} icon={<Shield className="w-5 h-5" />} />
        <KPICard title="Coverage Limit" value={formatCurrency(policy.coverage_limit)} icon={<FileText className="w-5 h-5" />} />
        <KPICard title="Claims Filed" value={claims.length} icon={<Calendar className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Policy Details</h3>
          <dl className="space-y-3">
            {[
              ['Type', policyTypeLabel(policy.type)],
              ['Effective Date', formatDate(policy.effective_date)],
              ['Expiration Date', formatDate(policy.expiration_date)],
              ['Carrier', carrier?.name || '—'],
              ['AM Best Rating', carrier?.am_best_rating || '—'],
              ['Description', policy.description || '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-sm text-gray-500">{label}</dt>
                <dd className="text-sm font-medium text-gray-900">{val}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Client Information</h3>
          {client ? (
            <dl className="space-y-3">
              {[
                ['Name', client.name],
                ['Contact', client.contact_name || '—'],
                ['Email', client.email || '—'],
                ['Phone', client.phone || '—'],
                ['Industry', client.industry || '—'],
                ['Risk Score', `${client.risk_score}/100`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{val}</dd>
                </div>
              ))}
            </dl>
          ) : <p className="text-sm text-gray-500">No client linked</p>}
        </Card>
      </div>

      {claims.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b"><h3 className="font-semibold text-gray-900">Claims History</h3></div>
          <DataTable
            data={claims}
            onRowClick={(c) => navigate(`/claims/${c.id}`)}
            columns={[
              { key: 'claim_number', header: 'Claim #', render: (c) => <span className="font-medium">{c.claim_number}</span> },
              { key: 'type', header: 'Type', render: (c) => policyTypeLabel(c.type || '') },
              { key: 'amount_claimed', header: 'Claimed', render: (c) => formatCurrency(c.amount_claimed) },
              { key: 'amount_paid', header: 'Paid', render: (c) => formatCurrency(c.amount_paid) },
              { key: 'date_filed', header: 'Filed', render: (c) => formatDate(c.date_filed) },
              { key: 'status', header: 'Status', render: (c) => <Badge variant={c.status}>{c.status.replace('_', ' ')}</Badge> },
            ]}
          />
        </Card>
      )}

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Policy">
        <div className="space-y-4">
          <Input label="Premium" type="number" value={form.premium || ''} onChange={v => setForm({ ...form, premium: v })} />
          <Input label="Deductible" type="number" value={form.deductible || ''} onChange={v => setForm({ ...form, deductible: v })} />
          <Input label="Coverage Limit" type="number" value={form.coverage_limit || ''} onChange={v => setForm({ ...form, coverage_limit: v })} />
          <Select label="Status" value={form.status || ''} onChange={v => setForm({ ...form, status: v })} options={[{ value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'pending', label: 'Pending' }]} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}
