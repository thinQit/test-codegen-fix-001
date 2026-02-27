import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionUser.userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
