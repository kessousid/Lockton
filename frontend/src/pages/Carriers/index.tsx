import { useState, useEffect } from 'react';
import { carriersApi } from '../../api/client';
import { Card, DataTable, SearchInput, Button, Badge, Spinner, Modal, Input, Select, showToast, KPICard } from '../../components/ui';
import { Plus, Building2, Wifi, WifiOff } from 'lucide-react';
import { Carrier } from '../../types';

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Carrier | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', am_best_rating: '', contact_email: '', contact_phone: '', website: '', specialties: '' });

  useEffect(() => {
    carriersApi.list().then(setCarriers).finally(() => setLoading(false));
  }, []);

  const filtered = carriers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = async (carrier: Carrier) => {
    setSelected(carrier);
    try {
      const m = await carriersApi.metrics(carrier.id);
      setMetrics(m);
    } catch { setMetrics(null); }
  };

  const handleAdd = async () => {
    try {
      await carriersApi.create(form);
      showToast('Carrier added');
      setShowAdd(false);
      carriersApi.list().then(setCarriers);
    } catch { showToast('Failed to add carrier', 'error'); }
  };

  if (loading) return <Spinner />;

  const integrated = carriers.filter(c => c.api_integrated).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrier Management</h1>
          <p className="text-sm text-gray-500 mt-1">{carriers.length} carriers · {integrated} API integrated</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add Carrier</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search carriers..." />
          </Card>
          <Card>
            <DataTable
              data={filtered}
              onRowClick={handleSelect}
              columns={[
                { key: 'name', header: 'Carrier', render: (c) => (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{c.name}</span>
                  </div>
                )},
                { key: 'am_best_rating', header: 'Rating', render: (c) => <Badge>{c.am_best_rating || 'NR'}</Badge> },
                { key: 'claims_ratio', header: 'Claims Ratio', render: (c) => `${c.claims_ratio}%` },
                { key: 'avg_response_time_days', header: 'Avg Response', render: (c) => `${c.avg_response_time_days} days` },
                { key: 'api_integrated', header: 'API', render: (c) => c.api_integrated ? (
                  <span className="flex items-center gap-1 text-green-600"><Wifi className="w-3 h-3" /> Active</span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400"><WifiOff className="w-3 h-3" /> None</span>
                )},
                { key: 'status', header: 'Status', render: (c) => <Badge variant={c.status}>{c.status}</Badge> },
              ]}
            />
          </Card>
        </div>

        <div>
          {selected ? (
            <Card className="p-6 sticky top-20">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{selected.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{selected.code}</p>
              <dl className="space-y-3">
                {[
                  ['AM Best Rating', selected.am_best_rating],
                  ['Email', selected.contact_email],
                  ['Phone', selected.contact_phone],
                  ['Website', selected.website],
                  ['Specialties', selected.specialties],
                  ['Integration', selected.integration_status],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd className="text-sm font-medium text-gray-900">{val || '—'}</dd>
                  </div>
                ))}
              </dl>
              {metrics && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Total Policies</span><span className="text-sm font-bold">{metrics.total_policies}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Total Premium</span><span className="text-sm font-bold">${(metrics.total_premium || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Total Commission</span><span className="text-sm font-bold">${(metrics.total_commission || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Claims Ratio</span><span className="text-sm font-bold">{metrics.claims_ratio}%</span></div>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-gray-500 text-center">Select a carrier to view details</p>
            </Card>
          )}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Carrier">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Input label="Code" value={form.code} onChange={v => setForm({ ...form, code: v })} />
          <Input label="AM Best Rating" value={form.am_best_rating} onChange={v => setForm({ ...form, am_best_rating: v })} />
          <Input label="Email" value={form.contact_email} onChange={v => setForm({ ...form, contact_email: v })} />
          <Input label="Phone" value={form.contact_phone} onChange={v => setForm({ ...form, contact_phone: v })} />
          <Input label="Website" value={form.website} onChange={v => setForm({ ...form, website: v })} />
          <Input label="Specialties" value={form.specialties} onChange={v => setForm({ ...form, specialties: v })} placeholder="Comma separated" />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add Carrier</Button>
        </div>
      </Modal>
    </div>
  );
}
