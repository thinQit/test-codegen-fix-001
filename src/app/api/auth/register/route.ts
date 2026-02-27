import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return NextResponse.json(
      {
        success: true,
        data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
