import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      healthTaskId,
      date,
      status,
      notes,
      inventoryItemId,
      quantityUsed,
    } = await request.json();

    if (!healthTaskId || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const taskDate = new Date(date);

    // TODO: Add fine-grained authorization to ensure user can access this health task.

    // Upsert the daily record. This will create it if it doesn't exist for that day,
    // or update it if it does.
    const dailyRecord = await prisma.dailyTaskRecord.upsert({
      where: {
        healthTaskId_date: {
          healthTaskId: healthTaskId,
          date: taskDate,
        },
      },
      update: {
        status,
        notes,
        inventoryItemId,
        quantityUsed,
      },
      create: {
        healthTaskId,
        date: taskDate,
        status,
        notes,
        inventoryItemId,
        quantityUsed,
      },
    });

    // After logging the day, check if the parent task is now fully complete
    const parentTask = await prisma.healthTask.findUnique({
      where: { id: healthTaskId },
      include: { dailyRecords: true },
    });

    if (parentTask) {
      const allComplete = parentTask.dailyRecords.length >= parentTask.durationInDays && parentTask.dailyRecords.every(r => r.status === 'COMPLETED');
      
      let parentStatus = parentTask.status;
      if (allComplete) {
        parentStatus = 'COMPLETED';
      } else if (parentTask.dailyRecords.length > 0 && parentTask.status !== 'IN_PROGRESS') {
        parentStatus = 'IN_PROGRESS';
      }

      if (parentTask.status !== parentStatus) {
        await prisma.healthTask.update({
          where: { id: healthTaskId },
          data: { status: parentStatus },
        });
      }
    }

    return NextResponse.json(dailyRecord, { status: 200 });

  } catch (error) {
    console.error('Error logging daily health task:', error);
    return NextResponse.json({ error: 'Failed to log task' }, { status: 500 });
  }
}
