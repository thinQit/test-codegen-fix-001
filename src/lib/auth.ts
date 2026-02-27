import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import prisma from '@/lib/db';

export interface AuthTokenPayload {
  sub: string;
  jti: string;
  exp?: number;
  iat?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRY_SECONDS = Number(process.env.JWT_EXPIRY_SECONDS || '900');

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): { token: string; expiresAt: Date } {
  const jti = randomUUID();
  const token = jwt.sign({ sub: userId, jti }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY_SECONDS,
  });
  const expiresAt = new Date(Date.now() + JWT_EXPIRY_SECONDS * 1000);
  return { token, expiresAt };
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (!authHeader) return null;
  const [type, value] = authHeader.split(' ');
  if (type !== 'Bearer' || !value) return null;
  return value;
}

export async function getSessionUser(request: Request): Promise<{ userId: string; token: string } | null> {
  const token = getTokenFromHeader(request.headers);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  const session = await prisma.authSession.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return null;

  return { userId: payload.sub, token };
}
