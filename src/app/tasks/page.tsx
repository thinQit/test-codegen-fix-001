'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

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

interface TaskListResponse {
  items: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    priority: '',
    tag: '',
    dueFrom: '',
    dueTo: '',
    page: 1,
    limit: 10,
  });

  const authHeaders = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    return params.toString();
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/tasks?${buildQuery()}`, {
          headers: { 'Content-Type': 'application/json', ...authHeaders },
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || response.statusText);
        }
        const payload = (await response.json()) as TaskListResponse;
        setTasks(payload.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [authHeaders, filters]);

  const updateFilter = (field: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground">Filter, search, and track every task.</p>
        </div>
        <Link href="/tasks/new">
          <Button>New task</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search"
            placeholder="Title or description"
            value={filters.q}
            onChange={event => updateFilter('q', event.target.value)}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={filters.status}
              onChange={event => updateFilter('status', event.target.value)}
            >
              <option value="">All</option>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Priority</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={filters.priority}
              onChange={event => updateFilter('priority', event.target.value)}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Input
            label="Tag"
            placeholder="e.g. frontend"
            value={filters.tag}
            onChange={event => updateFilter('tag', event.target.value)}
          />
          <Input
            label="Due from"
            type="date"
            value={filters.dueFrom}
            onChange={event => updateFilter('dueFrom', event.target.value)}
          />
          <Input
            label="Due to"
            type="date"
            value={filters.dueTo}
            onChange={event => updateFilter('dueTo', event.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-lg font-semibold">Unable to load tasks</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-lg font-semibold">No tasks found</p>
            <p className="text-sm text-muted-foreground">Try adjusting filters or create a new task.</p>
            <div className="mt-4 flex justify-center">
              <Link href="/tasks/new">
                <Button>Create task</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <Card key={task.id}>
              <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link href={`/tasks/${task.id}`} className="text-lg font-semibold hover:text-primary">
                    {task.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{task.status}</Badge>
                  <Badge variant="default">{task.priority}</Badge>
                  {task.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="success">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => goToPage(filters.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {filters.page}</span>
            <Button
              variant="outline"
              onClick={() => goToPage(filters.page + 1)}
              disabled={tasks.length < filters.limit}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
