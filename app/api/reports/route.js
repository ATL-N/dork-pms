// app/api/reports/route.js
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

  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId');
  const reportType = searchParams.get('reportType');
  const dateFrom = new Date(searchParams.get('dateRange[from]'));
  const dateTo = new Date(searchParams.get('dateRange[to]'));

  if (!farmId || !reportType) {
    return NextResponse.json({ error: 'Missing farmId or reportType' }, { status: 400 });
  }

  // Verify user has access to the farm
  const farmAccess = await prisma.farmUser.findFirst({
    where: {
      userId: user.id,
      farmId: farmId,
    },
  });

  if (!farmAccess && user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied to this farm' }, { status: 403 });
  }

  try {
    let data;
    switch (reportType) {
      case 'financial':
        data = await getFinancialReport(farmId, dateFrom, dateTo);
        break;
      case 'flock-performance':
        data = await getFlockPerformanceReport(farmId);
        break;
      case 'production':
        data = await getProductionReport(farmId, dateFrom, dateTo);
        break;
      case 'inventory-usage':
        data = await getInventoryUsageReport(farmId, dateFrom, dateTo);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
    
    await log({
      userId: user.id,
      farmId: farmId,
      action: `Generated ${reportType} report`,
      details: `User generated a report of type: ${reportType} for farm: ${farmId}`
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    return NextResponse.json({ error: `Failed to generate report: ${error.message}` }, { status: 500 });
  }
}

// --- Report Generation Functions ---

async function getFinancialReport(farmId, dateFrom, dateTo) {
    const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        include: {
            owner: {
                include: {
                    profile: true,
                },
            },
        },
    });
    const currency = farm?.owner?.profile?.currency || 'USD';

    const transactions = await prisma.transaction.findMany({
        where: {
            farmId,
            date: { gte: dateFrom, lte: dateTo },
        },
        orderBy: { date: 'asc' },
    });

    const summary = transactions.reduce((acc, tx) => {
        if (tx.type === 'REVENUE') acc.totalRevenue += tx.amount;
        if (tx.type === 'EXPENSE') acc.totalExpenses += tx.amount;
        return acc;
    }, { totalRevenue: 0, totalExpenses: 0 });

    summary.netProfit = summary.totalRevenue - summary.totalExpenses;

    const monthlyData = transactions.reduce((acc, tx) => {
        const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!acc[month]) acc[month] = { name: month, revenue: 0, expenses: 0 };
        if (tx.type === 'REVENUE') acc[month].revenue += tx.amount;
        if (tx.type === 'EXPENSE') acc[month].expenses += tx.amount;
        return acc;
    }, {});

    const chartData = {
        data: Object.values(monthlyData),
    };

    return { summary, chartData, transactions, currency };
}

async function getFlockPerformanceReport(farmId) {
    const flocks = await prisma.flock.findMany({
        where: { farmId },
        include: {
            feedConsumption: true,
            mortalityRecords: true,
            birdResales: true,
        }
    });

    const performanceData = flocks.map(flock => {
        const totalFeedConsumed = flock.feedConsumption.reduce((sum, record) => sum + record.quantity, 0);
        const totalMortality = flock.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalBirdsSold = flock.birdResales.reduce((sum, sale) => sum + sale.quantity, 0);
        const totalRevenueFromSales = flock.birdResales.reduce((sum, sale) => sum + (sale.quantity * sale.pricePerBird), 0);

        const initialCost = (flock.initialQuantity || 0) * (flock.costPerBird || 0);
        
        // Simplified FCR - for a more accurate one, we'd need weight gain data
        const fcr = totalFeedConsumed > 0 ? totalFeedConsumed / (flock.initialQuantity - totalMortality) : 0;
        const mortalityRate = flock.initialQuantity > 0 ? (totalMortality / flock.initialQuantity) * 100 : 0;
        
        // Simplified profit calculation
        const totalProfit = totalRevenueFromSales - initialCost;

        return {
            id: flock.id,
            name: flock.name,
            fcr,
            mortalityRate,
            costPerBird: flock.costPerBird || 0,
            totalProfit,
        };
    });
    
    const chartData = {
        data: performanceData.map(f => ({ name: f.name, profit: f.totalProfit })),
    };

    return { flocks: performanceData, chartData };
}

async function getProductionReport(farmId, dateFrom, dateTo) {
    const productionRecords = await prisma.eggProductionRecord.findMany({
        where: {
            flock: {
                farmId: farmId,
            },
            date: { gte: dateFrom, lte: dateTo },
        },
        orderBy: { date: 'asc' },
    });

    if (productionRecords.length === 0) {
        return { 
            summary: { totalEggs: 0, peakProduction: { date: '', eggs: 0 }, averageDailyProduction: 0 },
            chartData: { data: [] }
        };
    }

    const totalEggs = productionRecords.reduce((sum, r) => sum + r.totalEggs, 0);
    
    const dailyProduction = productionRecords.reduce((acc, r) => {
        const dateStr = new Date(r.date).toLocaleDateString('en-CA'); // YYYY-MM-DD for sorting
        acc[dateStr] = (acc[dateStr] || 0) + r.totalEggs;
        return acc;
    }, {});

    const peakProduction = Object.entries(dailyProduction).reduce((peak, [date, eggs]) => {
        return eggs > peak.eggs ? { date, eggs } : peak;
    }, { date: '', eggs: 0 });

    const averageDailyProduction = totalEggs > 0 ? totalEggs / Object.keys(dailyProduction).length : 0;

    const chartData = {
        data: Object.entries(dailyProduction)
            .map(([date, eggs]) => ({ name: new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' }), eggs }))
            .sort((a, b) => new Date(a.name) - new Date(b.name)),
    };

    return {
        summary: { totalEggs, peakProduction, averageDailyProduction },
        chartData,
    };
}

async function getInventoryUsageReport(farmId, dateFrom, dateTo) {
    // This report combines feed items and other inventory items used.
    
    const feedConsumption = await prisma.feedConsumption.findMany({
        where: {
            flock: {
                farmId: farmId,
            },
            date: { gte: dateFrom, lte: dateTo },
        },
        include: {
            feedItem: true,
        }
    });

    const healthTasks = await prisma.healthTask.findMany({
        where: {
            flock: {
                farmId: farmId,
            },
            scheduledDate: { gte: dateFrom, lte: dateTo },
            status: 'COMPLETED',
            inventoryItemId: { not: null }
        },
        include: {
            inventoryItem: true,
        }
    });

    const usageDataMap = new Map();

    feedConsumption.forEach(fc => {
        if (fc.feedItem) {
            const item = fc.feedItem;
            const existing = usageDataMap.get(item.id) || { ...item, quantityUsed: 0, category: item.category || 'Feed' };
            existing.quantityUsed += fc.quantity;
            usageDataMap.set(item.id, existing);
        }
    });

    healthTasks.forEach(hr => {
        if (hr.inventoryItem) {
            const item = hr.inventoryItem;
            const existing = usageDataMap.get(item.id) || { ...item, quantityUsed: 0 };
            existing.quantityUsed += (hr.quantityUsed || 1); // Fallback to 1 if quantityUsed is not specified
            usageDataMap.set(item.id, existing);
        }
    });

    const usageData = Array.from(usageDataMap.values());

    const usageByCategory = usageData.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + item.quantityUsed;
        return acc;
    }, {});

    const chartData = {
        data: Object.entries(usageByCategory).map(([name, value]) => ({ name, value })),
    };

    return { usageData, chartData };
}