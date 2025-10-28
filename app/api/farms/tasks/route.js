import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const userFarms = await prisma.farmUser.findMany({
      where: { userId: user.id },
      select: { farmId: true },
    });
    const farmIds = userFarms.map((uf) => uf.farmId);

    const tasks = await prisma.task.findMany({
      where: {
        farmId: {
          in: farmIds,
        },
      },
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
        message: `Error fetching tasks: ${error.message}`,
        userId: user.id,
        meta: {
            error
        }
    });
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 });
  }
}
