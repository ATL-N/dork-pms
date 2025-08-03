import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from "@/app/lib/logging";

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId');

  if (!farmId) {
    return NextResponse.json({ error: 'Farm ID is required' }, { status: 400 });
  }

  try {
    // Verify user has access to this farm
    const farmAccess = await prisma.farmUser.findFirst({
      where: {
        userId: user.id,
        farmId: farmId,
      },
    });

    if (!farmAccess && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied to this farm' }, { status: 403 });
    }

    const flocks = await prisma.flock.findMany({
      where: { farmId: farmId },
      include: {
        mortalities: true,
        feedConsumptions: {
          include: {
            feed: true,
          },
        },
        birdSales: true,
        eggProductions: true,
      },
    });

    let totalProfitAllFlocks = 0;

    const reportData = flocks.map(flock => {
      const initialCost = (flock.initialQuantity || 0) * (flock.costPerBird || 0);
      
      const totalMortality = flock.mortalities.reduce((sum, record) => sum + record.quantity, 0);
      const mortalityRate = flock.initialQuantity > 0 ? (totalMortality / flock.initialQuantity) * 100 : 0;
      
      const totalFeedConsumed = flock.feedConsumptions.reduce((sum, record) => sum + record.quantity, 0);
      const totalFeedCost = flock.feedConsumptions.reduce((sum, record) => {
          const feedCost = record.feed ? record.feed.unitPrice || 0 : 0;
          return sum + (record.quantity * feedCost);
      }, 0);

      const totalRevenueFromBirds = flock.birdSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalRevenueFromEggs = flock.eggProductions.reduce((sum, prod) => sum + (prod.revenue || 0), 0);
      const totalRevenue = totalRevenueFromBirds + totalRevenueFromEggs;

      // Simplified FCR: kg of feed / number of birds sold or eggs produced (in dozens)
      // This is a simplification and may need refinement based on broiler vs layer specifics
      let fcr = null;
      if (flock.type === 'BROILER') {
          const totalWeightSold = flock.birdSales.reduce((sum, sale) => sum + (sale.totalWeight || 0), 0);
          if (totalWeightSold > 0) {
              fcr = totalFeedConsumed / totalWeightSold;
          }
      } else if (flock.type === 'LAYER') {
          const totalDozens = flock.eggProductions.reduce((sum, p) => sum + p.quantity, 0) / 12;
          if (totalDozens > 0) {
              fcr = totalFeedConsumed / totalDozens;
          }
      }

      const totalCost = initialCost + totalFeedCost; // Simplified: does not include health costs yet
      const profit = totalRevenue - totalCost;
      totalProfitAllFlocks += profit;

      return {
        id: flock.id,
        name: flock.name,
        mortalityRate,
        fcr,
        costPerBird: flock.costPerBird, // This is the initial cost, not the final cost per bird
        profit,
      };
    });

    await log({
      action: 'generate_report',
      details: `Generated flock performance report for farm ${farmId}`,
      userId: user.id,
      farmId: farmId,
    });

    return NextResponse.json({
      flocks: reportData,
      summary: {
        totalProfit: totalProfitAllFlocks,
      }
    });

  } catch (error) {
    console.error('Failed to generate flock performance report:', error);
    return NextResponse.json({ error: 'Failed to generate report. ' + error.message }, { status: 500 });
  }
}
