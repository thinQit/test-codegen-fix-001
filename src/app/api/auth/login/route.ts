import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { signToken, verifyPassword } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const { token, expiresAt } = signToken(user.id);

    await prisma.authSession.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        expiresAt: expiresAt.toISOString(),
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
