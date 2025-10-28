// app/api/farms/[farmId]/custom-task-schedules/[scheduleId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId, scheduleId } = await params;
  const data = await request.json();
  const { applyToAllFarms, ...scheduleData } = data;

  try {
    if (applyToAllFarms) {
      const userFarms = await prisma.farm.findMany({
        where: { ownerId: user.id },
      });

      for (const farm of userFarms) {
        await prisma.customTaskSchedule.upsert({
          where: { farmId_taskName: { farmId: farm.id, taskName: scheduleData.taskName } },
          update: scheduleData,
          create: {
            ...scheduleData,
            farmId: farm.id,
          },
        });
        await prisma.farm.update({
          where: { id: farm.id },
          data: { useCustomSchedule: true },
        });
      }
      await logAction('INFO', `User ${user.id} updated and applied custom schedule "${scheduleData.taskName}" to all farms`, { userId: user.id });
    } else {
      const updatedSchedule = await prisma.customTaskSchedule.update({
        where: { id: scheduleId },
        data: scheduleData,
      });
      await logAction('INFO', `User ${user.id} updated custom schedule "${updatedSchedule.taskName}" for farm ${farmId}`, { userId: user.id, farmId });
    }

    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    await logAction('ERROR', `Error updating custom schedule for farm ${farmId}: ${error.message}`, { userId: user.id, farmId });
    return NextResponse.json({ error: 'Error updating schedule' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId, scheduleId } = await params;

  try {
    const scheduleToDelete = await prisma.customTaskSchedule.findUnique({
        where: { id: scheduleId }
    });

    if (!scheduleToDelete) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    if (scheduleToDelete.applyToAllFarms) {
        const userFarms = await prisma.farm.findMany({
            where: { ownerId: user.id },
        });

        for (const farm of userFarms) {
            await prisma.customTaskSchedule.deleteMany({
                where: {
                    farmId: farm.id,
                    taskName: scheduleToDelete.taskName,
                },
            });
        }
        await logAction('INFO', `User ${user.id} deleted custom schedule "${scheduleToDelete.taskName}" from all farms`, { userId: user.id });
    } else {
        await prisma.customTaskSchedule.delete({
            where: { id: scheduleId },
        });
        await logAction('INFO', `User ${user.id} deleted custom schedule "${scheduleToDelete.taskName}" for farm ${farmId}`, { userId: user.id, farmId });
    }

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    await logAction('ERROR', `Error deleting custom schedule for farm ${farmId}: ${error.message}`, { userId: user.id, farmId });
    return NextResponse.json({ error: 'Error deleting schedule' }, { status: 500 });
  }
}
