import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const statusOptions = ['todo', 'in-progress', 'done'] as const;
const priorityOptions = ['low', 'medium', 'high'] as const;

const TaskUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(statusOptions),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.enum(priorityOptions),
  tags: z.array(z.string()).optional(),
});

const TaskPatchSchema = TaskUpdateSchema.partial();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: { id: params.id, ownerId: sessionUser.userId },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch task';
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
    const parsed = TaskUpdateSchema.parse(body);

    const existing = await prisma.task.findFirst({
      where: { id: params.id, ownerId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: parsed.title,
        description: parsed.description ?? '',
        status: parsed.status,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        priority: parsed.priority,
        tags: parsed.tags ?? [],
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
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
    const parsed = TaskPatchSchema.parse(body);

    const existing = await prisma.task.findFirst({
      where: { id: params.id, ownerId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: parsed.title ?? existing.title,
        description: parsed.description ?? existing.description,
        status: parsed.status ?? existing.status,
        dueDate: parsed.dueDate !== undefined ? (parsed.dueDate ? new Date(parsed.dueDate) : null) : existing.dueDate,
        priority: parsed.priority ?? existing.priority,
        tags: parsed.tags ?? existing.tags ?? [],
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.task.findFirst({
      where: { id: params.id, ownerId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
