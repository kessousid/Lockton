import { useState, useEffect } from 'react';
import { authApi } from '../../api/client';
import { Card, DataTable, Button, Badge, Modal, Input, Select, Spinner, showToast } from '../../components/ui';
import { Plus, Users, Shield, Clock } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../store/AuthContext';

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState('users');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'broker', phone: '', department: '' });

  useEffect(() => {
    authApi.users().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    try {
      await authApi.register(form);
      showToast('User created');
      setShowAdd(false);
      authApi.users().then(setUsers);
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const toggleUser = async (user: User) => {
    try {
      if (user.is_active) {
        await authApi.deleteUser(user.id);
        showToast('User deactivated');
      } else {
        await authApi.updateUser(user.id, { is_active: true });
        showToast('User activated');
      }
      authApi.users().then(setUsers);
    } catch { showToast('Update failed', 'error'); }
  };

  const tabs = [
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'roles', label: 'Roles & Permissions', icon: Shield },
    { key: 'audit', label: 'Audit Log', icon: Clock },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings & Administration</h1>
        <p className="text-sm text-gray-500 mt-1">System configuration and user management</p>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.key ? 'bg-lockton-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add User</Button>
          </div>
          <Card>
            <DataTable
              data={users}
              columns={[
                { key: 'full_name', header: 'Name', render: (u) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-lockton-navy rounded-full flex items-center justify-center text-white text-sm font-bold">{u.full_name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                )},
                { key: 'role', header: 'Role', render: (u) => <Badge>{u.role}</Badge> },
                { key: 'department', header: 'Department' },
                { key: 'phone', header: 'Phone' },
                { key: 'is_active', header: 'Status', render: (u) => <Badge variant={u.is_active ? 'active' : 'expired'}>{u.is_active ? 'Active' : 'Inactive'}</Badge> },
                { key: 'actions', header: '', sortable: false, render: (u) => u.id !== currentUser?.id ? (
                  <Button size="sm" variant={u.is_active ? 'danger' : 'secondary'} onClick={() => toggleUser(u)}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                ) : null },
              ]}
            />
          </Card>
        </>
      )}

      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { role: 'Admin', desc: 'Full system access', perms: ['User Management', 'Settings', 'All Modules', 'Analytics', 'AI Assistant'] },
            { role: 'Broker', desc: 'Client and policy management', perms: ['Clients', 'Policies', 'Claims', 'Renewals', 'Carriers', 'Certificates', 'Documents', 'Workflows', 'Analytics', 'AI Assistant'] },
            { role: 'Client', desc: 'Self-service portal', perms: ['Dashboard', 'My Policies', 'My Claims', 'Certificates', 'Documents'] },
            { role: 'Analyst', desc: 'Analytics and reporting', perms: ['Dashboard', 'Clients (read)', 'Policies (read)', 'Claims (read)', 'Analytics', 'AI Assistant'] },
          ].map(r => (
            <Card key={r.role} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-lockton-navy" />
                <h3 className="font-semibold text-gray-900">{r.role}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {r.perms.map(p => <Badge key={p}>{p}</Badge>)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'User login', user: 'Sarah Mitchell', time: '2 minutes ago' },
              { action: 'Policy POL-001023 updated', user: 'James Rodriguez', time: '15 minutes ago' },
              { action: 'Claim CLM-005003 status changed to approved', user: 'Emily Chen', time: '1 hour ago' },
              { action: 'New client created: Digital Media Partners', user: 'Michael Thompson', time: '2 hours ago' },
              { action: 'Certificate COI-20000005 generated', user: 'James Rodriguez', time: '3 hours ago' },
              { action: 'Renewal moved to quoted', user: 'Emily Chen', time: '4 hours ago' },
              { action: 'Document uploaded: Policy renewal form', user: 'Sarah Mitchell', time: '5 hours ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-lockton-navy flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.user}</p>
                </div>
                <span className="text-xs text-gray-400">{log.time}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add User">
        <div className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} required />
          <Input label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} required />
          <Input label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} required />
          <Select label="Role" value={form.role} onChange={v => setForm({ ...form, role: v })} options={[{ value: 'admin', label: 'Admin' }, { value: 'broker', label: 'Broker' }, { value: 'client', label: 'Client' }, { value: 'analyst', label: 'Analyst' }]} />
          <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Input label="Department" value={form.department} onChange={v => setForm({ ...form, department: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Create User</Button>
        </div>
      </Modal>
    </div>
  );
}
