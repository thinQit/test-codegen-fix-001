'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/providers/ToastProvider';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string | null;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function Page() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const authHeaders = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const taskId = params?.id as string;

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
          headers: { 'Content-Type': 'application/json', ...authHeaders },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || response.statusText);
        }
        const payload = (await response.json()) as Task;
        setTask(payload);
        setForm(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load task.');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [authHeaders, taskId]);

  const updateField = (field: keyof Task, value: string) => {
    setForm(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          status: form.status,
          dueDate: form.dueDate || null,
          priority: form.priority,
          tags: form.tags || [],
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || response.statusText);
      }
      const payload = (await response.json()) as Task;
      setTask(payload);
      setForm(payload);
      toast('Task updated.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || response.statusText);
      }
      toast('Task deleted.', 'success');
      router.push('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete task.');
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-lg font-semibold">Unable to load task</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => router.push('/tasks')}>
          Back to tasks
        </Button>
      </div>
    );
  }

  if (!task || !form) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-lg font-semibold">Task not found</p>
        <Button className="mt-4" onClick={() => router.push('/tasks')}>
          Back to tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Task details</h1>
              <p className="text-sm text-muted-foreground">
                Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <Badge variant={task.status === 'done' ? 'success' : 'secondary'}>{task.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={event => updateField('title', event.target.value)}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              rows={4}
              value={form.description}
              onChange={event => updateField('description', event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={form.status}
                onChange={event => updateField('status', event.target.value as Task['status'])}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <Input
              label="Due date"
              type="date"
              value={form.dueDate ? form.dueDate.split('T')[0] : ''}
              onChange={event => updateField('dueDate', event.target.value)}
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Priority</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={form.priority}
                onChange={event => updateField('priority', event.target.value as Task['priority'])}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <Input
            label="Tags"
            value={form.tags?.join(', ') || ''}
            onChange={event => updateField('tags', event.target.value)}
            helperText="Separate tags with commas"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              Delete task
            </Button>
            <Button onClick={handleSave} loading={saving}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete task">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={saving}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Page;
