import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = await params;

  try {
    // Ensure the user has access to this farm
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId,
        userId: user.id,
      },
    });

    if (!farmUser && user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { farmId },
      orderBy: { dueDate: 'asc' },
      include: {
        flock: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    await log({
        level: 'ERROR',
        message: `Error fetching tasks for farm ${farmId}: ${error.message}`,
        userId: user.id,
        meta: {
            farmId,
            error
        }
    });
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = await params;
  const data = await request.json();

  try {
    // Ensure the user is an owner or manager of this farm
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId,
        userId: user.id,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    });

    if (!farmUser && user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, dueDate, flockId, assignedToId } = data;

    if (!title || !dueDate || !flockId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        farmId,
        flockId,
        title,
        description,
        dueDate: new Date(dueDate),
        assignedToId,
        status: 'PENDING',
      },
    });
    
    await log({
        level: 'INFO',
        message: `User ${user.email} created a new task "${title}" for flock ${flockId} in farm ${farmId}`,
        userId: user.id,
        meta: {
            farmId,
            flockId,
            taskId: task.id
        }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    await log({
        level: 'ERROR',
        message: `Error creating task for farm ${farmId}: ${error.message}`,
        userId: user.id,
        meta: {
            farmId,
            error
        }
    });
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 });
  }
}
