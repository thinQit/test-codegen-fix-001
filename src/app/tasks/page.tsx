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

export const runtime = 'nodejs';

export default function TasksPage() {
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
  }, [authHeaders, buildQuery]);

  return (
    <div>
      {/* Render logic here */}
    </div>
  );
}
