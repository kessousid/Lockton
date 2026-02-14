import { useState, useEffect } from 'react';
import { documentsApi, clientsApi } from '../../api/client';
import { Card, DataTable, SearchInput, Button, Badge, Select, Spinner, Modal, Input, showToast } from '../../components/ui';
import { Upload, FileText, File, Image, Table, FolderOpen, Trash2 } from 'lucide-react';
import { Document, Client } from '../../types';
import { formatDate } from '../../utils';

const fileIcons: Record<string, any> = { pdf: FileText, image: Image, docx: File, xlsx: Table };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: '', category: 'other', client_id: '', description: '' });

  useEffect(() => {
    Promise.all([documentsApi.list(), clientsApi.list()])
      .then(([d, c]) => { setDocuments(d); setClients(c); })
      .finally(() => setLoading(false));
  }, []);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));

  const filtered = documents.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && d.category !== categoryFilter) return false;
    return true;
  });

  const handleUpload = async () => {
    if (!file) { showToast('Select a file', 'error'); return; }
    const formData = new FormData();
    formData.append('file', file);
    if (form.name) formData.append('name', form.name);
    formData.append('category', form.category);
    if (form.client_id) formData.append('client_id', form.client_id);
    if (form.description) formData.append('description', form.description);
    try {
      await documentsApi.upload(formData);
      showToast('Document uploaded');
      setShowUpload(false);
      setFile(null);
      documentsApi.list().then(setDocuments);
    } catch { showToast('Upload failed', 'error'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await documentsApi.delete(id);
      showToast('Document deleted');
      setDocuments(documents.filter(d => d.id !== id));
    } catch { showToast('Delete failed', 'error'); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
          <p className="text-sm text-gray-500 mt-1">{documents.length} documents</p>
        </div>
        <Button onClick={() => setShowUpload(true)}><Upload className="w-4 h-4 mr-2" />Upload Document</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} placeholder="Search documents..." /></div>
          <Select value={categoryFilter} onChange={setCategoryFilter} options={[{ value: '', label: 'All Categories' }, { value: 'policy', label: 'Policy' }, { value: 'claim', label: 'Claim' }, { value: 'certificate', label: 'Certificate' }, { value: 'endorsement', label: 'Endorsement' }, { value: 'invoice', label: 'Invoice' }, { value: 'other', label: 'Other' }]} className="w-44" />
        </div>
      </Card>

      <Card>
        <DataTable
          data={filtered}
          columns={[
            { key: 'name', header: 'Document', render: (d) => {
              const Icon = fileIcons[d.file_type || ''] || File;
              return <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-gray-400" /><span className="font-medium">{d.name}</span></div>;
            }},
            { key: 'category', header: 'Category', render: (d) => <Badge>{d.category || 'other'}</Badge> },
            { key: 'client_id', header: 'Client', render: (d) => d.client_id ? clientMap[d.client_id] || `#${d.client_id}` : '—' },
            { key: 'file_size', header: 'Size', render: (d) => formatSize(d.file_size) },
            { key: 'version', header: 'Version', render: (d) => `v${d.version}` },
            { key: 'created_at', header: 'Uploaded', render: (d) => formatDate(d.created_at) },
            { key: 'actions', header: '', sortable: false, render: (d) => (
              <button onClick={() => handleDelete(d.id)} className="p-1 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )},
          ]}
        />
      </Card>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm border rounded-lg p-2" />
          </div>
          <Input label="Document Name (optional)" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Leave empty to use filename" />
          <Select label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} options={[{ value: 'policy', label: 'Policy' }, { value: 'claim', label: 'Claim' }, { value: 'certificate', label: 'Certificate' }, { value: 'endorsement', label: 'Endorsement' }, { value: 'invoice', label: 'Invoice' }, { value: 'other', label: 'Other' }]} />
          <Select label="Client" value={form.client_id} onChange={v => setForm({ ...form, client_id: v })} options={[{ value: '', label: 'None' }, ...clients.map(c => ({ value: String(c.id), label: c.name }))]} />
          <Input label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button onClick={handleUpload}>Upload</Button>
        </div>
      </Modal>
    </div>
  );
}
