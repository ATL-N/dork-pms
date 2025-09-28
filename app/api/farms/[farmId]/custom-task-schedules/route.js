// app/api/farms/[farmId]/custom-task-schedules/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = params;

  try {
    const schedules = await prisma.customTaskSchedule.findMany({
      where: { farmId },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    await logAction('ERROR', `Error fetching custom schedules for farm ${farmId}: ${error.message}`, { userId: user.id, farmId });
    return NextResponse.json({ error: 'Error fetching schedules' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = params;
  const data = await request.json();
  const { applyToAllFarms, ...scheduleData } = data;

  try {
    if (applyToAllFarms) {
      const userFarms = await prisma.farm.findMany({
        where: { ownerId: user.id },
      });

      for (const farm of userFarms) {
        await prisma.customTaskSchedule.create({
          data: {
            ...scheduleData,
            farmId: farm.id,
            applyToAllFarms: true,
          },
        });
        await prisma.farm.update({
            where: { id: farm.id },
            data: { useCustomSchedule: true },
        });
      }
      await logAction('INFO', `User ${user.id} created and applied custom schedule "${scheduleData.taskName}" to all farms`, { userId: user.id });
      return NextResponse.json({ message: 'Schedule created and applied to all farms' }, { status: 201 });

    } else {
      const newSchedule = await prisma.customTaskSchedule.create({
        data: {
          ...scheduleData,
          farmId,
          applyToAllFarms: false,
        },
      });
      await prisma.farm.update({
        where: { id: farmId },
        data: { useCustomSchedule: true },
      });
      await logAction('INFO', `User ${user.id} created custom schedule "${scheduleData.taskName}" for farm ${farmId}`, { userId: user.id, farmId });
      return NextResponse.json(newSchedule, { status: 201 });
    }
  } catch (error) {
    await logAction('ERROR', `Error creating custom schedule for farm ${farmId}: ${error.message}`, { userId: user.id, farmId });
    return NextResponse.json({ error: 'Error creating schedule' }, { status: 500 });
  }
}
