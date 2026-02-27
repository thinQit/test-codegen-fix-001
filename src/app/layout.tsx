import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Toaster from '@/components/ui/Toaster';
import AuthProvider from '@/providers/AuthProvider';
import ToastProvider from '@/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'A simple task manager web application with user authentication and task tracking.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="min-h-screen bg-background">
              {children}
            </main>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
