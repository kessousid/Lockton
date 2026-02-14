import { useState, useEffect } from 'react';
import { workflowsApi } from '../../api/client';
import { Card, DataTable, Button, Badge, Spinner, Modal, Input, Select, Textarea, showToast } from '../../components/ui';
import { Plus, GitBranch, CheckCircle, Play, Pause } from 'lucide-react';
import { Workflow, WorkflowTask } from '../../types';
import { formatDate } from '../../utils';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'custom', trigger: 'manual', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    Promise.all([workflowsApi.list(), workflowsApi.tasks()])
      .then(([w, t]) => { setWorkflows(w); setTasks(t); })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    try {
      await workflowsApi.create(form);
      showToast('Workflow created');
      setShowAdd(false);
      workflowsApi.list().then(setWorkflows);
    } catch { showToast('Failed to create workflow', 'error'); }
  };

  const handleAddTask = async () => {
    if (!selected) return;
    try {
      await workflowsApi.createTask({ ...taskForm, workflow_id: selected.id });
      showToast('Task created');
      setShowAddTask(false);
      workflowsApi.tasks().then(setTasks);
    } catch { showToast('Failed to create task', 'error'); }
  };

  const completeTask = async (taskId: number) => {
    try {
      await workflowsApi.completeTask(taskId);
      showToast('Task completed');
      workflowsApi.tasks().then(setTasks);
    } catch { showToast('Failed to complete task', 'error'); }
  };

  if (loading) return <Spinner />;

  const workflowTasks = selected ? tasks.filter(t => t.workflow_id === selected.id) : [];
  const steps = selected?.steps_json ? JSON.parse(selected.steps_json) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
          <p className="text-sm text-gray-500 mt-1">{workflows.length} workflows · {tasks.filter(t => t.status !== 'completed').length} active tasks</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />New Workflow</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="space-y-3">
          {workflows.map(w => (
            <Card
              key={w.id}
              hover
              onClick={() => setSelected(w)}
              className={`p-4 ${selected?.id === w.id ? 'ring-2 ring-lockton-navy' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${w.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <GitBranch className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{w.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={w.status}>{w.status}</Badge>
                    <span className="text-xs text-gray-400">{w.trigger}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Workflow Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selected.name}</h3>
                    <p className="text-sm text-gray-500">{selected.description}</p>
                  </div>
                  <Badge variant={selected.status}>{selected.status}</Badge>
                </div>

                {/* Steps visualization */}
                {steps.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Workflow Steps</h4>
                    <div className="space-y-2">
                      {steps.map((step: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-lockton-navy text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step.step}</div>
                          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2">
                            <p className="text-sm font-medium">{step.action}</p>
                            <p className="text-xs text-gray-400">{step.type}</p>
                          </div>
                          {i < steps.length - 1 && <div className="w-px h-4 bg-gray-300 ml-4" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Tasks */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700">Tasks ({workflowTasks.length})</h4>
                  <Button size="sm" onClick={() => setShowAddTask(true)}><Plus className="w-3 h-3 mr-1" />Add Task</Button>
                </div>
                <div className="space-y-2">
                  {workflowTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                      <button
                        onClick={() => task.status !== 'completed' && completeTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}
                      >
                        {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                        {task.description && <p className="text-xs text-gray-500">{task.description}</p>}
                      </div>
                      <Badge variant={task.priority}>{task.priority}</Badge>
                      <Badge variant={task.status}>{task.status}</Badge>
                    </div>
                  ))}
                  {workflowTasks.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a workflow to view details</p>
            </Card>
          )}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Workflow">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Select label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={[{ value: 'renewal_reminder', label: 'Renewal Reminder' }, { value: 'claims_routing', label: 'Claims Routing' }, { value: 'certificate_generation', label: 'Certificate Generation' }, { value: 'custom', label: 'Custom' }]} />
          <Select label="Trigger" value={form.trigger} onChange={v => setForm({ ...form, trigger: v })} options={[{ value: 'manual', label: 'Manual' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'event', label: 'Event' }]} />
          <Textarea label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Create</Button>
        </div>
      </Modal>

      <Modal open={showAddTask} onClose={() => setShowAddTask(false)} title="Add Task">
        <div className="space-y-4">
          <Input label="Title" value={taskForm.title} onChange={v => setTaskForm({ ...taskForm, title: v })} required />
          <Textarea label="Description" value={taskForm.description} onChange={v => setTaskForm({ ...taskForm, description: v })} />
          <Select label="Priority" value={taskForm.priority} onChange={v => setTaskForm({ ...taskForm, priority: v })} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAddTask(false)}>Cancel</Button>
          <Button onClick={handleAddTask}>Add Task</Button>
        </div>
      </Modal>
    </div>
  );
}
