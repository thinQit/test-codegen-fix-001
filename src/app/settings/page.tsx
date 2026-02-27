'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function Page() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Content-Type': 'application/json', ...authHeaders },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || response.statusText);
        }
        const payload = (await response.json()) as Profile;
        setProfile(payload);
        setForm({ name: payload.name, email: payload.email });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authHeaders]);

  const handleUpdate = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || response.statusText);
      }
      const payload = (await response.json()) as Profile;
      setProfile(payload);
      toast('Profile updated.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      });
    } finally {
      logout();
      toast('Logged out successfully.', 'success');
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
        <p className="text-lg font-semibold">Unable to load settings</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-lg font-semibold">Profile not available</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Profile settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account information.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
          </p>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="outline" onClick={handleLogout}>Log out</Button>
            <Button onClick={handleUpdate} loading={saving}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
