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

export const runtime = 'nodejs';

export default function DashboardPage() {
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

  return (
    <div>
      {/* Render logic here */}
    </div>
  );
}
