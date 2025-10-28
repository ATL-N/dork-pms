// app/api/farms/[farmId]/production/kpis/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findUnique({
            where: { farmId_userId: { farmId, userId: user.id } },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        const sevenDaysAgo = subDays(new Date(), 7);
        const thirtyDaysAgo = subDays(new Date(), 30);

        // KPI 1: Total Egg Production (Last 7 Days)
        const eggProduction = await prisma.eggProductionRecord.aggregate({
            _sum: { totalEggs: true },
            where: {
                flock: { farmId },
                date: { gte: sevenDaysAgo },
            },
        });

        // KPI 2: Average Eggs Per Bird
        const totalActiveBirds = await prisma.flock.aggregate({
            _sum: { quantity: true },
            where: { farmId, status: 'active', type: 'LAYER' },
        });
        const totalEggsAllTime = await prisma.eggProductionRecord.aggregate({
            _sum: { totalEggs: true },
            where: { flock: { farmId } },
        });
        const avgEggsPerBird = (totalEggsAllTime._sum.totalEggs || 0) / (totalActiveBirds._sum.quantity || 1);

        // KPI 3: Feed Conversion Ratio (FCR) - Simplified
        const totalFeedConsumed = await prisma.feedConsumption.aggregate({
            _sum: { quantity: true },
            where: { flock: { farmId } },
        });
        const totalWeightGain = await prisma.growthRecord.aggregate({
            _sum: { weight: true }, // This is a simplification
            where: { flock: { farmId } },
        });
        const fcr = (totalFeedConsumed._sum.quantity || 0) / (totalWeightGain._sum.weight || 1);
        
        // KPI 4: Total Birds Sold (This Month)
        const birdsSold = await prisma.birdResale.aggregate({
            _sum: { quantity: true },
            where: {
                flock: { farmId },
                date: { gte: thirtyDaysAgo },
            },
        });

        return NextResponse.json({
            totalEggsLast7Days: eggProduction._sum.totalEggs || 0,
            avgEggsPerBird: avgEggsPerBird,
            fcr: fcr,
            birdsSoldLast30Days: birdsSold._sum.quantity || 0,
        });

    } catch (error) {
        // Simplified error logging for brevity
        console.error(`Failed to fetch KPIs for farm ${farmId}: ${error.message}`);
        return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
    }
}
