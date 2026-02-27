import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getSessionUser, verifyToken } from '@/lib/auth';

const SessionCreateSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.authSession.findMany({
      where: { userId: sessionUser.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SessionCreateSchema.parse(body);

    const payload = verifyToken(parsed.token);
    if (!payload || payload.sub !== sessionUser.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
    }

    const session = await prisma.authSession.create({
      data: {
        token: parsed.token,
        expiresAt: new Date(parsed.expiresAt),
        userId: sessionUser.userId,
      },
    });

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
