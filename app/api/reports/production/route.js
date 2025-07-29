import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { log } from '@/app/lib/logging';
import { format } from 'date-fns';

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

    const productionRecords = await prisma.eggProduction.findMany({
      where: {
        flock: {
          farmId: farmId,
        },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Aggregate data by date for the chart
    const trendData = productionRecords.reduce((acc, record) => {
      const dateStr = format(new Date(record.date), 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalEggs: 0,
          damagedEggs: 0,
        };
      }
      acc[dateStr].totalEggs += record.quantity;
      acc[dateStr].damagedEggs += record.damaged;
      return acc;
    }, {});

    const eggProductionTrend = Object.values(trendData);

    // Calculate summary statistics
    const totalEggs = productionRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalDamaged = productionRecords.reduce((sum, r) => sum + r.damaged, 0);
    
    const dateDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
    const avgDailyProduction = totalEggs / dateDiff;

    let peakProduction = { date: 'N/A', value: 0 };
    if (eggProductionTrend.length > 0) {
        peakProduction = eggProductionTrend.reduce((max, day) => day.totalEggs > max.value ? { date: day.date, value: day.totalEggs } : max, { date: eggProductionTrend[0].date, value: eggProductionTrend[0].totalEggs });
    }
    
    await log({
      action: 'generate_report',
      details: `Generated production report for farm ${farmId}`,
      userId: user.id,
      farmId: farmId,
    });

    return NextResponse.json({
      startDate,
      endDate,
      eggProductionTrend,
      summary: {
        totalEggs,
        totalDamaged,
        avgDailyProduction,
        peakProduction,
      },
    });

  } catch (error) {
    console.error('Failed to generate production report:', error);
    return NextResponse.json({ error: 'Failed to generate report. ' + error.message }, { status: 500 });
  }
}
