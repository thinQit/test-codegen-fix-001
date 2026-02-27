'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
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

interface DashboardSummary {
  total: number;
  byStatus: {
    todo: number;
    inProgress: number;
    done: number;
  };
  upcoming: Task[];
  overdue: Task[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function Page() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/summary`, {
          headers: { 'Content-Type': 'application/json', ...authHeaders },
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || response.statusText);
        }
        const payload = (await response.json()) as DashboardSummary;
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [authHeaders]);

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
        <p className="text-lg font-semibold">Unable to load dashboard</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Your dashboard is empty</h1>
        <p className="mt-2 text-muted-foreground">Create your first task to see insights here.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/tasks/new">
            <Button>Create a task</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Summary of your tasks and deadlines.</p>
        </div>
        <Link href="/tasks/new">
          <Button>New task</Button>
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Total tasks</p>
            <h2 className="text-2xl font-semibold">{data.total}</h2>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">To do</p>
            <h2 className="text-2xl font-semibold">{data.byStatus.todo}</h2>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">In progress</p>
            <h2 className="text-2xl font-semibold">{data.byStatus.inProgress}</h2>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Done</p>
            <h2 className="text-2xl font-semibold">{data.byStatus.done}</h2>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upcoming in 7 days</h3>
              <Badge variant="warning">{data.upcoming.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming tasks in the next week.</p>
            ) : (
              <ul className="space-y-3">
                {data.upcoming.map(task => (
                  <li key={task.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="secondary">{task.priority}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Overdue</h3>
              <Badge variant="error">{data.overdue.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing overdue. Keep it up!</p>
            ) : (
              <ul className="space-y-3">
                {data.overdue.map(task => (
                  <li key={task.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="error">Overdue</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default Page;
