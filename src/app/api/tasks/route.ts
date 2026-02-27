import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

const TaskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
});

const statusOptions = ['todo', 'in-progress', 'done'] as const;
const priorityOptions = ['low', 'medium', 'high'] as const;

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tag = searchParams.get('tag');
    const q = searchParams.get('q');
    const dueFrom = searchParams.get('dueFrom');
    const dueTo = searchParams.get('dueTo');
    const page = Math.max(Number(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || '20'), 1), 100);

    const where: Prisma.TaskWhereInput = {
      ownerId: sessionUser.userId,
    };

    if (status && statusOptions.includes(status as (typeof statusOptions)[number])) {
      where.status = status;
    }
    if (priority && priorityOptions.includes(priority as (typeof priorityOptions)[number])) {
      where.priority = priority;
    }
    if (tag) {
      where.tags = { array_contains: [tag] };
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (dueFrom || dueTo) {
      where.dueDate = {
        gte: dueFrom ? new Date(dueFrom) : undefined,
        lte: dueTo ? new Date(dueTo) : undefined,
      };
    }

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        meta: { total, page, limit },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load tasks';
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
    const parsed = TaskCreateSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description ?? '',
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        priority: parsed.priority ?? 'medium',
        tags: parsed.tags ?? [],
        ownerId: sessionUser.userId,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
