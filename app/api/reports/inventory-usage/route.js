import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!farmId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Farm ID and a valid date range are required' }, { status: 400 });
  }

  try {
    const farmAccess = await prisma.farmUser.findFirst({
      where: { userId: user.id, farmId: farmId },
    });

    if (!farmAccess && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied to this farm' }, { status: 403 });
    }

    // 1. Get Feed Usage
    const feedConsumptions = await prisma.feedConsumption.findMany({
      where: {
        flock: {
          farmId: farmId,
        },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        feedItem: true,
      },
    });

    // 2. Get Health Supply Usage from completed HealthTasks
    const healthTasks = await prisma.healthTask.findMany({
        where: {
            flock: {
                farmId: farmId
            },
            status: 'COMPLETED',
            completedDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
            inventoryItemId: {
                not: null
            },
            quantityUsed: {
                not: null
            }
        },
        include: {
            inventoryItem: true
        }
    });

    const usageMap = new Map();

    // Process feed consumption
    feedConsumptions.forEach(consumption => {
      const item = consumption.feedItem;
      if (!item) return;

      if (!usageMap.has(item.id)) {
        usageMap.set(item.id, {
          id: item.id,
          name: item.name,
          category: item.category || 'Feed',
          unit: item.unit,
          totalUsage: 0,
        });
      }
      usageMap.get(item.id).totalUsage += consumption.quantity;
    });

    // Process health supply usage
    healthTasks.forEach(task => {
        const item = task.inventoryItem;
        if (!item) return;

        if (!usageMap.has(item.id)) {
            usageMap.set(item.id, {
                id: item.id,
                name: item.name,
                category: item.category,
                unit: item.unit,
                totalUsage: 0,
            });
        }
        usageMap.get(item.id).totalUsage += task.quantityUsed;
    });

    const usageData = Array.from(usageMap.values()).sort((a, b) => b.totalUsage - a.totalUsage);

    await log({
      action: 'generate_report',
      details: `Generated inventory usage report for farm ${farmId}`,
      userId: user.id,
      farmId: farmId,
    });

    return NextResponse.json({
      startDate,
      endDate,
      usage: usageData,
    });

  } catch (error) {
    console.error('Failed to generate inventory usage report:', error);
    return NextResponse.json({ error: 'Failed to generate report. ' + error.message }, { status: 500 });
  }
}
