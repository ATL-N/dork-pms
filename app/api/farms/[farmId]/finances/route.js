// app/api/farms/[farmId]/finances/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId } = params;
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const farmAccess = await prisma.farmUser.findUnique({
        where: { farmId_userId: { farmId, userId: user.id } },
    });

    if (!farmAccess && user.userType !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'thisMonth';
    // Other filters will be added later

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisYearStart = startOfYear(now);

    try {
        // --- KPI Calculations ---
        const [revenueThisMonth, expensesThisMonth, revenueYTD, expensesYTD] = await Promise.all([
            prisma.revenue.aggregate({ _sum: { amount: true }, where: { farmId, date: { gte: thisMonthStart } } }),
            prisma.expense.aggregate({ _sum: { amount: true }, where: { farmId, date: { gte: thisMonthStart } } }),
            prisma.revenue.aggregate({ _sum: { amount: true }, where: { farmId, date: { gte: thisYearStart } } }),
            prisma.expense.aggregate({ _sum: { amount: true }, where: { farmId, date: { gte: thisYearStart } } }),
        ]);

        const kpis = {
            revenueThisMonth: revenueThisMonth._sum.amount || 0,
            expensesThisMonth: expensesThisMonth._sum.amount || 0,
            netProfitThisMonth: (revenueThisMonth._sum.amount || 0) - (expensesThisMonth._sum.amount || 0),
            netProfitYTD: (revenueYTD._sum.amount || 0) - (expensesYTD._sum.amount || 0),
        };

        // --- Chart Data (last 6 months) ---
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);

            const [monthlyRevenue, monthlyExpenses] = await Promise.all([
                prisma.revenue.aggregate({ _sum: { amount: true }, where: { farmId, date: { gte: monthStart, lte: monthEnd } } }),
                prisma.expense.aggregate({ _sum: { amount: true }, where: { farmId, date: { gte: monthStart, lte: monthEnd } } }),
            ]);

            chartData.push({
                name: monthStart.toLocaleString('default', { month: 'short' }),
                revenue: monthlyRevenue._sum.amount || 0,
                expenses: monthlyExpenses._sum.amount || 0,
            });
        }

        // --- Transactions & Invoices ---
        // This will be expanded with filtering later
        const [revenues, expenses, invoices] = await Promise.all([
            prisma.revenue.findMany({ where: { farmId }, orderBy: { date: 'desc' } }),
            prisma.expense.findMany({ where: { farmId }, orderBy: { date: 'desc' } }),
            prisma.invoice.findMany({ where: { farmId }, orderBy: { date: 'desc' } }),
        ]);

        const transactions = [
            ...revenues.map(r => ({ ...r, type: 'REVENUE' })),
            ...expenses.map(e => ({ ...e, type: 'EXPENSE' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));


        await logAction('INFO', `User ${user.id} viewed financial data for farm ${farmId}.`, { userId: user.id, farmId });

        return NextResponse.json({
            kpis,
            chartData,
            transactions,
            invoices,
        });

    } catch (error) {
        console.error("Failed to fetch financial data:", error);
        await logAction('ERROR', `Failed to fetch financial data for farm ${farmId}. Error: ${error.message}`, { userId: user.id, farmId, error: error.stack });
        return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }
}
