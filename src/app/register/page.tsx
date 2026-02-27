'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { data, error: apiError } = await api.post<RegisterResponse>('/api/auth/register', {
      name: form.name,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (apiError || !data) {
      setError(apiError || 'Registration failed.');
      return;
    }

    toast('Registration successful. Please log in.', 'success');
    router.push('/login');
  };

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start tracking tasks in minutes.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={event => handleChange('name', event.target.value)}
              placeholder="Jane Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={event => handleChange('email', event.target.value)}
              placeholder="jane@example.com"
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
            <Input
              label="Confirm password"
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={event => handleChange('confirm', event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
