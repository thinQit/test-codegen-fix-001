import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodDays = Number(searchParams.get('period') || '7');
    const windowDays = [7, 30].includes(periodDays) ? periodDays : 7;

    const now = new Date();
    const upcomingUntil = new Date(Date.now() + windowDays * 24 * 60 * 60 * 1000);

    const [total, todo, inProgress, done, upcoming, overdue] = await Promise.all([
      prisma.task.count({ where: { ownerId: sessionUser.userId } }),
      prisma.task.count({ where: { ownerId: sessionUser.userId, status: 'todo' } }),
      prisma.task.count({ where: { ownerId: sessionUser.userId, status: 'in-progress' } }),
      prisma.task.count({ where: { ownerId: sessionUser.userId, status: 'done' } }),
      prisma.task.findMany({
        where: {
          ownerId: sessionUser.userId,
          dueDate: { gte: now, lte: upcomingUntil },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          ownerId: sessionUser.userId,
          dueDate: { lt: now },
          status: { not: 'done' },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        byStatus: {
          todo,
          inProgress,
          done,
        },
        upcoming,
        overdue,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard summary';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
