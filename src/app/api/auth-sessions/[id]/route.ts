import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const SessionUpdateSchema = z.object({
  expiresAt: z.string().datetime(),
});

const SessionPatchSchema = SessionUpdateSchema.partial();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.authSession.findFirst({
      where: { id: params.id, userId: sessionUser.userId },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch session';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SessionUpdateSchema.parse(body);

    const session = await prisma.authSession.findFirst({
      where: { id: params.id, userId: sessionUser.userId },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const updated = await prisma.authSession.update({
      where: { id: params.id },
      data: { expiresAt: new Date(parsed.expiresAt) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update session';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SessionPatchSchema.parse(body);

    const session = await prisma.authSession.findFirst({
      where: { id: params.id, userId: sessionUser.userId },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const updated = await prisma.authSession.update({
      where: { id: params.id },
      data: {
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : session.expiresAt,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update session';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.authSession.findFirst({
      where: { id: params.id, userId: sessionUser.userId },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    await prisma.authSession.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete session';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
