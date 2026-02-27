'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import { useAuth } from '@/providers/AuthProvider';

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
    role?: 'customer' | 'admin';
  };
}

export function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: apiError } = await api.post<LoginResponse>('/api/auth/login', {
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (apiError || !data) {
      setError(apiError || 'Invalid credentials.');
      return;
    }

    localStorage.setItem('token', data.token);
    login({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      createdAt: data.user.createdAt || new Date().toISOString(),
      updatedAt: data.user.updatedAt || new Date().toISOString(),
      role: data.user.role || 'customer',
    });

    toast('Welcome back!', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="text-sm text-muted-foreground">Access your task workspace.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={event => handleChange('email', event.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={event => handleChange('password', event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Log in
            </Button>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link href="/register" className="font-medium text-primary">
                Create account
              </Link>
              <span className="text-muted-foreground">Forgot password?</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
