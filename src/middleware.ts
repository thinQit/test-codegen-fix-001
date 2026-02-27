import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/tasks/:path*',
    '/api/dashboard/:path*',
    '/api/auth/me',
    '/api/auth/logout',
    '/api/users/:path*',
    '/api/auth-sessions/:path*',
  ],
};
