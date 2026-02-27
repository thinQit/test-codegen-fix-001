'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';

interface TaskCreatePayload {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: TaskCreatePayload = {
      title: form.title,
      description: form.description,
      dueDate: form.dueDate || null,
      priority: form.priority as 'low' | 'medium' | 'high',
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    };

    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || response.statusText);
      }
      toast('Task created successfully.', 'success');
      router.push('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Create a task</h1>
          <p className="text-sm text-muted-foreground">Add details so you can track progress.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              value={form.title}
              onChange={event => handleChange('title', event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                value={form.description}
                onChange={event => handleChange('description', event.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Due date"
                type="date"
                value={form.dueDate}
                onChange={event => handleChange('dueDate', event.target.value)}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={form.priority}
                  onChange={event => handleChange('priority', event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <Input
              label="Tags"
              helperText="Separate tags with commas"
              value={form.tags}
              onChange={event => handleChange('tags', event.target.value)}
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>Create task</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
