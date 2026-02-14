import { useState, useEffect } from 'react';
import { certificatesApi, clientsApi, policiesApi } from '../../api/client';
import { Card, DataTable, SearchInput, Button, Badge, Spinner, Modal, Input, Select, showToast } from '../../components/ui';
import { Plus, Download, Award, Copy } from 'lucide-react';
import { Certificate, Client, Policy } from '../../types';
import { formatDate } from '../../utils';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showPdf, setShowPdf] = useState<any>(null);
  const [form, setForm] = useState({ client_id: '', policy_id: '', holder_name: '', holder_address: '', requested_by: '' });

  useEffect(() => {
    Promise.all([certificatesApi.list(), clientsApi.list(), policiesApi.list()])
      .then(([c, cl, p]) => { setCerts(c); setClients(cl); setPolicies(p); })
      .finally(() => setLoading(false));
  }, []);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));
  const filtered = certs.filter(c => !search || c.certificate_number?.toLowerCase().includes(search.toLowerCase()) || c.holder_name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    try {
      await certificatesApi.create({ ...form, client_id: Number(form.client_id), policy_id: Number(form.policy_id) });
      showToast('Certificate generated');
      setShowAdd(false);
      certificatesApi.list().then(setCerts);
    } catch { showToast('Failed to generate certificate', 'error'); }
  };

  const viewPdf = async (cert: Certificate) => {
    try {
      const data = await certificatesApi.pdf(cert.id);
      setShowPdf(data);
    } catch { showToast('Failed to load certificate', 'error'); }
  };

  if (loading) return <Spinner />;

  const clientPolicies = form.client_id ? policies.filter(p => p.client_id === Number(form.client_id) && p.status === 'active') : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
          <p className="text-sm text-gray-500 mt-1">{certs.length} certificates issued</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Generate Certificate</Button>
      </div>

      <Card className="p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search certificates..." />
      </Card>

      <Card>
        <DataTable
          data={filtered}
          columns={[
            { key: 'certificate_number', header: 'Certificate #', render: (c) => <span className="font-medium text-lockton-navy flex items-center gap-1"><Award className="w-4 h-4" />{c.certificate_number}</span> },
            { key: 'client_id', header: 'Client', render: (c) => clientMap[c.client_id] || `#${c.client_id}` },
            { key: 'holder_name', header: 'Holder' },
            { key: 'issued_date', header: 'Issued', render: (c) => formatDate(c.issued_date) },
            { key: 'expiration_date', header: 'Expires', render: (c) => formatDate(c.expiration_date) },
            { key: 'status', header: 'Status', render: (c) => <Badge variant={c.status}>{c.status}</Badge> },
            { key: 'actions', header: '', sortable: false, render: (c) => (
              <Button size="sm" variant="ghost" onClick={() => viewPdf(c)}>
                <Download className="w-4 h-4" />
              </Button>
            )},
          ]}
        />
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Generate Certificate of Insurance" size="lg">
        <div className="space-y-4">
          <Select label="Client" value={form.client_id} onChange={v => setForm({ ...form, client_id: v, policy_id: '' })} options={[{ value: '', label: 'Select Client' }, ...clients.map(c => ({ value: String(c.id), label: c.name }))]} />
          <Select label="Policy" value={form.policy_id} onChange={v => setForm({ ...form, policy_id: v })} options={[{ value: '', label: 'Select Policy' }, ...clientPolicies.map(p => ({ value: String(p.id), label: `${p.policy_number} — ${p.type}` }))]} />
          <Input label="Certificate Holder Name" value={form.holder_name} onChange={v => setForm({ ...form, holder_name: v })} required />
          <Input label="Holder Address" value={form.holder_address} onChange={v => setForm({ ...form, holder_address: v })} />
          <Input label="Requested By" value={form.requested_by} onChange={v => setForm({ ...form, requested_by: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Generate</Button>
        </div>
      </Modal>

      <Modal open={!!showPdf} onClose={() => setShowPdf(null)} title="Certificate of Insurance" size="lg">
        {showPdf && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-lockton-navy">CERTIFICATE OF LIABILITY INSURANCE</h2>
              <p className="text-sm text-gray-500 mt-1">Certificate Number: {showPdf.certificate_number}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="border-b pb-2"><p className="text-gray-500">Insured</p><p className="font-medium">{showPdf.client_name}</p></div>
              <div className="border-b pb-2"><p className="text-gray-500">Certificate Holder</p><p className="font-medium">{showPdf.holder_name}</p></div>
              <div className="border-b pb-2"><p className="text-gray-500">Policy Number</p><p className="font-medium">{showPdf.policy_number}</p></div>
              <div className="border-b pb-2"><p className="text-gray-500">Policy Type</p><p className="font-medium">{showPdf.policy_type}</p></div>
              <div className="border-b pb-2"><p className="text-gray-500">Coverage Limit</p><p className="font-medium">${(showPdf.coverage_limit || 0).toLocaleString()}</p></div>
              <div className="border-b pb-2"><p className="text-gray-500">Status</p><Badge variant={showPdf.status}>{showPdf.status}</Badge></div>
              <div className="border-b pb-2"><p className="text-gray-500">Effective Date</p><p className="font-medium">{showPdf.effective_date}</p></div>
              <div className="border-b pb-2"><p className="text-gray-500">Expiration Date</p><p className="font-medium">{showPdf.expiration_date}</p></div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">This certificate is issued as a matter of information only and confers no rights upon the certificate holder.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
