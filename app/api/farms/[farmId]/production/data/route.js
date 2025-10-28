// app/api/farms/[farmId]/production/data/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { subDays, format } from 'date-fns';

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
        
        // For now, we ignore filters for simplicity, but they can be added here
        const eggRecords = await prisma.eggProductionRecord.findMany({
            where: { flock: { farmId: farmId } },
            include: { flock: { select: { name: true } } },
            orderBy: { date: 'desc' },
        });

        const growthRecords = await prisma.growthRecord.findMany({
            where: { flock: { farmId: farmId } },
            include: { flock: { select: { name: true } } },
            orderBy: { date: 'desc' },
        });

        // Format for table
        const tableData = [
            ...eggRecords.map(d => ({ ...d, recordType: 'EGG_PRODUCTION' })),
            ...growthRecords.map(d => ({ ...d, recordType: 'WEIGHT_RECORD' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Format for trend chart (grouped by day)
        const trendDataMap = new Map();
        tableData.forEach(rec => {
            const day = format(new Date(rec.date), 'yyyy-MM-dd');
            if (!trendDataMap.has(day)) {
                trendDataMap.set(day, { date: day, eggs: 0, weight: 0, count: 0 });
            }
            const entry = trendDataMap.get(day);
            if (rec.recordType === 'EGG_PRODUCTION') {
                entry.eggs += rec.totalEggs;
            } else {
                entry.weight += rec.weight;
                entry.count += 1;
            }
        });
        const trendData = Array.from(trendDataMap.values()).map(d => ({...d, weight: d.count > 0 ? d.weight / d.count : 0})).sort((a,b) => new Date(a.date) - new Date(b.date));


        // Format for comparison chart (grouped by flock)
        const comparisonDataMap = new Map();
        tableData.forEach(rec => {
            if (!comparisonDataMap.has(rec.flockId)) {
                comparisonDataMap.set(rec.flockId, { name: rec.flock.name, totalEggs: 0, avgWeight: 0, count: 0 });
            }
            const entry = comparisonDataMap.get(rec.flockId);
            if (rec.recordType === 'EGG_PRODUCTION') {
                entry.totalEggs += rec.totalEggs;
            } else {
                entry.avgWeight += rec.weight;
                entry.count += 1;
            }
        });
        const comparisonData = Array.from(comparisonDataMap.values()).map(d => ({...d, avgWeight: d.count > 0 ? d.avgWeight / d.count : 0}));

        return NextResponse.json({ tableData, trendData, comparisonData });

    } catch (error) {
        console.error(`Failed to fetch production data for farm ${farmId}: ${error.message}`);
        return NextResponse.json({ error: 'Failed to fetch production data' }, { status: 500 });
    }
}
