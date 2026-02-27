import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

const UserCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

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
      data: [{ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = UserCreateSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
