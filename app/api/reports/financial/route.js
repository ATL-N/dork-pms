import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from "@/app/lib/logging";

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser(request);
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

    const revenues = await prisma.revenue.groupBy({
      by: ['category'],
      where: {
        farmId: farmId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        farmId: farmId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const totalRevenue = revenues.reduce((sum, item) => sum + item._sum.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item._sum.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    await log({
      action: 'generate_report',
      details: `Generated financial report for farm ${farmId}`,
      userId: user.id,
      farmId: farmId,
    });

    return NextResponse.json({
      startDate,
      endDate,
      revenues: revenues.map(r => ({ category: r.category, total: r._sum.amount })),
      expenses: expenses.map(e => ({ category: e.category, total: e._sum.amount })),
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
      },
    });

  } catch (error) {
    console.error('Failed to generate financial report:', error);
    return NextResponse.json({ error: 'Failed to generate report. ' + error.message }, { status: 500 });
  }
}
