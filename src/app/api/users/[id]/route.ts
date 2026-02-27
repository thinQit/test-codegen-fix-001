import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

const UserUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
});

const UserPatchSchema = UserUpdateSchema.partial();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionUser.userId !== params.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionUser.userId !== params.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UserUpdateSchema.parse(body);

    const passwordHash = parsed.password ? await hashPassword(parsed.password) : undefined;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: passwordHash ?? undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionUser.userId !== params.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UserPatchSchema.parse(body);

    const passwordHash = parsed.password ? await hashPassword(parsed.password) : undefined;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: parsed.name ?? undefined,
        email: parsed.email ?? undefined,
        passwordHash: passwordHash ?? undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionUser.userId !== params.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.task.deleteMany({ where: { ownerId: params.id } }),
      prisma.authSession.deleteMany({ where: { userId: params.id } }),
      prisma.user.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
