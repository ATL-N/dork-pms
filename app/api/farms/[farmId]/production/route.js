// app/api/farms/[farmId]/production/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { farmId } = params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user has access to this farm
  const farmAccess = await prisma.farmUser.findUnique({
    where: {
      farmId_userId: {
        farmId: farmId,
        userId: user.id,
      },
    },
  });

  if (!farmAccess && user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dateRange = searchParams.get('dateRange') || 'last30days';
  const flockType = searchParams.get('flockType') || 'all';

  let startDate;
  const now = new Date();

  switch (dateRange) {
    case 'last7days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'allTime':
      startDate = new Date(0); // The beginning of time
      break;
    case 'last30days':
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
  }

  try {
    // 1. Fetch all necessary raw data in parallel
    const [
        flocks,
        eggRecordsRaw,
        growthRecordsRaw,
        feedRecords,
        birdSalesMonth,
    ] = await prisma.$transaction([
        prisma.flock.findMany({ where: { farmId } }),
        prisma.eggProductionRecord.findMany({
            where: { flock: { farmId }, date: { gte: startDate } },
            include: { flock: { select: { name: true, type: true } } },
            orderBy: { date: 'desc' },
        }),
        prisma.growthRecord.findMany({
            where: { flock: { farmId }, date: { gte: startDate } },
            include: { flock: { select: { name: true, type: true } } },
            orderBy: { date: 'desc' },
        }),
        prisma.feedConsumption.findMany({
            where: { flock: { farmId }, date: { gte: startDate } },
            include: { flock: { select: { type: true } } }
        }),
        prisma.birdResale.findMany({
            where: {
                flock: { farmId },
                date: { 
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        }),
    ]);

    // Add recordType to each record and combine
    const eggRecords = eggRecordsRaw.map(r => ({ ...r, recordType: 'EGG_PRODUCTION' }));
    const growthRecords = growthRecordsRaw.map(r => ({ ...r, recordType: 'GROWTH_RECORD' }));

    // Filter flocks based on flockType filter, if specified
    const filteredFlocks = flockType === 'all' ? flocks : flocks.filter(f => f.type === flockType);
    const filteredFlockIds = filteredFlocks.map(f => f.id);

    // Combine and filter records based on the selected flocks, then sort by date
    const combinedRecords = [...eggRecords, ...growthRecords]
        .filter(r => filteredFlockIds.includes(r.flockId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Use the combined and filtered list for subsequent calculations
    const productionRecords = combinedRecords;

    // --- KPI Calculations ---
    
    // Total Egg Production (Last 7 Days)
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
    const totalEggsLast7Days = eggRecords
        .filter(r => new Date(r.date) >= sevenDaysAgo)
        .reduce((sum, record) => sum + record.totalEggs, 0);

    // Total Birds Sold (This Month)
    const birdsSoldThisMonth = birdSalesMonth.reduce((sum, sale) => sum + sale.quantity, 0);

    // Average Eggs Per Bird (for layer flocks in the period)
    const layerFlocks = flocks.filter(f => f.type === 'LAYER' && f.status === 'active');
    const totalBirdsInLayerFlocks = layerFlocks.reduce((sum, flock) => sum + flock.quantity, 0);
    const totalEggsInPeriod = eggRecords.filter(r => filteredFlockIds.includes(r.flockId)).reduce((sum, r) => sum + r.totalEggs, 0);
    const avgEggsPerBird = totalBirdsInLayerFlocks > 0 ? totalEggsInPeriod / totalBirdsInLayerFlocks : 0;

    // Feed Conversion Ratio (FCR) for Layers
    const layerFlockIds = layerFlocks.map(f => f.id);
    const feedForLayers = feedRecords
        .filter(fr => layerFlockIds.includes(fr.flockId))
        .reduce((sum, fr) => sum + fr.quantity, 0);
    const fcr = totalEggsInPeriod > 0 ? feedForLayers / (totalEggsInPeriod / 12) : 0; // kg of feed per dozen eggs

    const kpis = {
        totalEggsLast7Days,
        birdsSoldThisMonth,
        avgEggsPerBird,
        fcr,
    };

    // --- Chart Data Preparation ---

    // Production Trend (time-series) - only for eggs for now
    const trendData = eggRecords.filter(r => filteredFlockIds.includes(r.flockId)).reduce((acc, record) => {
        const dateStr = new Date(record.date).toISOString().split('T')[0];
        if (!acc[dateStr]) {
            acc[dateStr] = { date: dateStr, totalEggs: 0 };
        }
        acc[dateStr].totalEggs += record.totalEggs;
        return acc;
    }, {});
    const productionTrend = Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Flock vs Flock Comparison - only for eggs for now
    const comparisonData = eggRecords.filter(r => filteredFlockIds.includes(r.flockId)).reduce((acc, record) => {
        const flockName = record.flock.name;
        if (!acc[flockName]) {
            acc[flockName] = { flockName, totalEggs: 0 };
        }
        acc[flockName].totalEggs += record.totalEggs;
        return acc;
    }, {});
    const flockComparison = Object.values(comparisonData);

    await logAction('INFO', `User ${user.id} viewed production data for farm ${farmId}.`, { userId: user.id, farmId });

    return NextResponse.json({
      kpis,
      records: productionRecords,
      flockComparison,
      productionTrend,
    });

  } catch (error) {
    console.error("Failed to fetch production data:", error);
    await logAction('ERROR', `Failed to fetch production data for farm ${farmId}. Error: ${error.message}`, { userId: user.id, farmId, error: error.stack });
    return NextResponse.json({ error: 'Failed to fetch production data' }, { status: 500 });
  }
}