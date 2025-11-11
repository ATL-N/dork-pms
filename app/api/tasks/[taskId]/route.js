import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { taskId } = await params;
  const data = await request.json();

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Ensure the user has access to the farm this task belongs to
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId: task.farmId,
        userId: user.id,
      },
    });

    if (!farmUser && user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If updating status, any farm user can do it.
    // If updating other details, only owner/manager can do it.
    if (data.status) {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                status: data.status,
            },
        });
        await log({
            level: 'INFO',
            message: `User ${user.email} updated task "${updatedTask.title}" to ${data.status}`,
            userId: user.id,
            meta: {
                taskId,
                farmId: task.farmId,
            }
        });
        return NextResponse.json(updatedTask);
    }


    // For other updates, check for owner/manager role
    const isOwnerOrManager = await prisma.farmUser.findFirst({
        where: {
            farmId: task.farmId,
            userId: user.id,
            role: { in: ['OWNER', 'MANAGER'] },
        },
    });

    if (!isOwnerOrManager && user.userType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized to edit task details' }, { status: 403 });
    }
    
    const { title, description, dueDate, assignedToId } = data;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId,
      },
    });

    await log({
        level: 'INFO',
        message: `User ${user.email} edited task "${updatedTask.title}"`,
        userId: user.id,
        meta: {
            taskId,
            farmId: task.farmId,
        }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    await log({
        level: 'ERROR',
        message: `Error updating task ${taskId}: ${error.message}`,
        userId: user.id,
        meta: {
            taskId,
            error
        }
    });
    return NextResponse.json({ error: 'Error updating task' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Ensure the user is an owner or manager of this farm
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId: task.farmId,
        userId: user.id,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    });

    if (!farmUser && user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    await log({
        level: 'INFO',
        message: `User ${user.email} deleted task "${task.title}"`,
        userId: user.id,
        meta: {
            taskId,
            farmId: task.farmId,
        }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    await log({
        level: 'ERROR',
        message: `Error deleting task ${taskId}: ${error.message}`,
        userId: user.id,
        meta: {
            taskId,
            error
        }
    });
    return NextResponse.json({ error: 'Error deleting task' }, { status: 500 });
  }
}
