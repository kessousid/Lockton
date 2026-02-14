import { useState, useEffect } from 'react';
import { renewalsApi, clientsApi } from '../../api/client';
import { Card, Badge, Button, Spinner, Modal, Select, Textarea, showToast } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils';
import { RefreshCcw } from 'lucide-react';
import { Renewal, Client } from '../../types';

const KANBAN_COLUMNS = [
  { key: 'upcoming', label: 'Upcoming', color: 'bg-blue-50 border-blue-200' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'quoted', label: 'Quoted', color: 'bg-purple-50 border-purple-200' },
  { key: 'approved', label: 'Approved', color: 'bg-green-50 border-green-200' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-50 border-emerald-200' },
];

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Renewal | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    Promise.all([renewalsApi.list(), clientsApi.list()])
      .then(([r, c]) => { setRenewals(r); setClients(c); })
      .finally(() => setLoading(false));
  }, []);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));

  const moveRenewal = async (renewal: Renewal, newStatus: string) => {
    try {
      await renewalsApi.update(renewal.id, { status: newStatus });
      showToast(`Renewal moved to ${newStatus.replace('_', ' ')}`);
      renewalsApi.list().then(setRenewals);
      setSelected(null);
    } catch { showToast('Update failed', 'error'); }
  };

  if (loading) return <Spinner />;

  const stats = {
    total: renewals.length,
    upcoming: renewals.filter(r => ['upcoming', 'in_progress', 'quoted'].includes(r.status)).length,
    completed: renewals.filter(r => r.status === 'completed').length,
    lost: renewals.filter(r => r.status === 'lost').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renewal Management</h1>
          <p className="text-sm text-gray-500 mt-1">{stats.upcoming} active · {stats.completed} completed · {stats.lost} lost</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'kanban' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('kanban')}>Kanban</Button>
          <Button variant={view === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('list')}>List</Button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(col => {
            const items = renewals.filter(r => r.status === col.key);
            return (
              <div key={col.key} className={`flex-shrink-0 w-72 rounded-xl border ${col.color} p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(r => (
                    <Card key={r.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(r)}>
                      <p className="text-sm font-medium text-gray-900 truncate">{clientMap[r.client_id] || `Client #${r.client_id}`}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Due: {formatDate(r.due_date)}</span>
                        <Badge variant={r.priority}>{r.priority}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">{formatCurrency(r.premium_current)}</span>
                        {r.premium_change_pct !== 0 && (
                          <span className={r.premium_change_pct > 0 ? 'text-red-600' : 'text-green-600'}>
                            {r.premium_change_pct > 0 ? '+' : ''}{r.premium_change_pct}%
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                  {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No renewals</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Client', 'Due Date', 'Current Premium', 'Proposed', 'Change', 'Priority', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {renewals.map(r => (
                  <tr key={r.id} onClick={() => setSelected(r)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{clientMap[r.client_id] || `#${r.client_id}`}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(r.due_date)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(r.premium_current)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(r.premium_proposed)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={r.premium_change_pct > 0 ? 'text-red-600' : 'text-green-600'}>
                        {r.premium_change_pct > 0 ? '+' : ''}{r.premium_change_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge variant={r.priority}>{r.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={r.status}>{r.status.replace('_', ' ')}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Renewal Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Client</p><p className="text-sm font-medium">{clientMap[selected.client_id]}</p></div>
              <div><p className="text-xs text-gray-500">Due Date</p><p className="text-sm font-medium">{formatDate(selected.due_date)}</p></div>
              <div><p className="text-xs text-gray-500">Current Premium</p><p className="text-sm font-medium">{formatCurrency(selected.premium_current)}</p></div>
              <div><p className="text-xs text-gray-500">Proposed Premium</p><p className="text-sm font-medium">{formatCurrency(selected.premium_proposed)}</p></div>
              <div><p className="text-xs text-gray-500">Change</p><p className="text-sm font-medium">{selected.premium_change_pct}%</p></div>
              <div><p className="text-xs text-gray-500">Priority</p><Badge variant={selected.priority}>{selected.priority}</Badge></div>
              <div><p className="text-xs text-gray-500">Status</p><Badge variant={selected.status}>{selected.status.replace('_', ' ')}</Badge></div>
              <div><p className="text-xs text-gray-500">Last Contacted</p><p className="text-sm font-medium">{formatDate(selected.last_contacted)}</p></div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Move to</p>
              <div className="flex flex-wrap gap-2">
                {KANBAN_COLUMNS.filter(c => c.key !== selected.status).map(c => (
                  <Button key={c.key} size="sm" variant="secondary" onClick={() => moveRenewal(selected, c.key)}>{c.label}</Button>
                ))}
                <Button size="sm" variant="danger" onClick={() => moveRenewal(selected, 'lost')}>Mark Lost</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
