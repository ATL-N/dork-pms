// app/api/farms/[farmId]/flock-report/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

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

        const { searchParams } = new URL(request.url);
        const flockId = searchParams.get('flockId');

        if (!flockId) {
            return NextResponse.json({ error: 'Flock ID is required' }, { status: 400 });
        }

        const flock = await prisma.flock.findUnique({ where: { id: flockId } });
        if (!flock) {
            return NextResponse.json({ error: 'Flock not found' }, { status: 404 });
        }

        const events = [];

        // Direct Expense: Flock acquisition
        if (flock.costPerBird > 0) {
            const totalCost = flock.costPerBird * flock.initialQuantity;
            events.push({
                date: flock.startDate.toISOString(),
                description: `Acquisition of ${flock.initialQuantity} birds`,
                amount: -totalCost,
                type: 'Expense',
                category: 'Flock Procurement',
            });
        }

        // Direct Revenue: Bird Resales
        const birdSales = await prisma.birdResale.findMany({ where: { flockId } });
        birdSales.forEach(sale => {
            events.push({
                date: sale.date.toISOString(),
                description: `Sale of ${sale.quantity} birds`,
                amount: sale.revenue,
                type: 'Revenue',
                category: 'Bird Sales',
            });
        });

        // Apportioned Revenue: Egg Sales
        const eggProduction = await prisma.eggProductionRecord.aggregate({
            _sum: { totalEggs: true },
            where: { flockId },
        });
        const totalEggsFromFlock = eggProduction._sum.totalEggs || 0;

        if (totalEggsFromFlock > 0) {
            const farmEggSales = await prisma.eggSale.aggregate({
                _sum: { quantity: true, amount: true },
                where: { farmId },
            });
            const totalFarmEggRevenue = farmEggSales._sum.amount || 0;
            const totalFarmEggsSold = farmEggSales._sum.quantity || 0;
            if (totalFarmEggsSold > 0) {
                const avgRevenuePerEgg = totalFarmEggRevenue / totalFarmEggsSold;
                events.push({
                    date: (flock.firstEggDate || new Date()).toISOString(),
                    description: `Estimated revenue from ${totalEggsFromFlock} eggs`,
                    amount: totalEggsFromFlock * avgRevenuePerEgg,
                    type: 'Revenue',
                    category: 'Egg Sales',
                });
            }
        }

        // Apportioned Expenses: Feed
        const feedConsumptions = await prisma.feedConsumption.findMany({
            where: { flockId },
            include: { inventoryLot: { include: { inventoryItem: true } } },
        });

        feedConsumptions.forEach(consumption => {
            if (consumption.inventoryLot) {
                const costPerUnit = consumption.inventoryLot.totalCost / consumption.inventoryLot.initialQuantity;
                events.push({
                    date: consumption.date.toISOString(),
                    description: `Feed: ${consumption.inventoryLot.inventoryItem.name}`,
                    amount: -(consumption.quantity * costPerUnit),
                    type: 'Expense',
                    category: 'Feed',
                });
            }
        });

        // Apportioned Expenses: Medication
        const medicationConsumptions = await prisma.dailyTaskRecord.findMany({
            where: {
                healthTask: { flockId: flockId },
                inventoryLotId: { not: null },
                quantityUsed: { gt: 0 },
            },
            include: {
                inventoryLot: true,
                healthTask: { select: { taskName: true } }
            },
        });

        medicationConsumptions.forEach(consumption => {
            if (consumption.inventoryLot) {
                const costPerUnit = consumption.inventoryLot.totalCost / consumption.inventoryLot.initialQuantity;
                events.push({
                    date: consumption.date.toISOString(),
                    description: `Medication: ${consumption.healthTask.taskName}`,
                    amount: -(consumption.quantityUsed * costPerUnit),
                    type: 'Expense',
                    category: 'Medication',
                });
            }
        });
        
        // Sort events by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate totals and breakdowns
        const revenueBreakdown = { eggSales: 0, birdSales: 0, other: 0 };
        const expenseBreakdown = { flockProcurement: 0, feed: 0, medication: 0, other: 0 };

        events.forEach(event => {
            if (event.type === 'Revenue') {
                if (event.category === 'Egg Sales') revenueBreakdown.eggSales += event.amount;
                else if (event.category === 'Bird Sales') revenueBreakdown.birdSales += event.amount;
                else revenueBreakdown.other += event.amount;
            } else if (event.type === 'Expense') {
                // Amounts are negative, so we add them up
                if (event.category === 'Flock Procurement') expenseBreakdown.flockProcurement += event.amount;
                else if (event.category === 'Feed') expenseBreakdown.feed += event.amount;
                else if (event.category === 'Medication') expenseBreakdown.medication += event.amount;
                else expenseBreakdown.other += event.amount;
            }
        });

        const totalRevenue = Object.values(revenueBreakdown).reduce((sum, val) => sum + val, 0);
        const totalExpenses = Object.values(expenseBreakdown).reduce((sum, val) => sum + val, 0);

        const report = {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue + totalExpenses,
            revenueBreakdown,
            expenseBreakdown,
            events,
        };

        return NextResponse.json(report);

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to generate flock financial report. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
