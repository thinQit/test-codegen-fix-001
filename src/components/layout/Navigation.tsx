'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/tasks/new', label: 'New Task' },
  { href: '/settings', label: 'Settings' }
];

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold" aria-label="Task Manager home">
          Task Manager
        </Link>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Open menu</span>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary">
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border px-4 py-3 space-y-3">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="block text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" fullWidth>Login</Button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button fullWidth>Sign Up</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Signed in as {user?.name}</span>
              <Button variant="outline" onClick={() => { logout(); setOpen(false); }} fullWidth>
                Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;
