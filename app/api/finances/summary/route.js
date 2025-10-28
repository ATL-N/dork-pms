
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { z } from 'zod';
import { startOfYear, endOfYear } from 'date-fns';

const prisma = new PrismaClient();

const searchParamsSchema = z.object({
  farmId: z.string().min(1, 'Farm ID is required.'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
});

export async function GET(request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const validation = searchParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { farmId, startDate, endDate } = validation.data;

  try {
    // Check if user has access to the farm
    const farmUser = await prisma.farmUser.findUnique({
      where: {
        farmId_userId: {
          farmId,
          userId: currentUser.id,
        },
      },
    });

    const owner = await prisma.farm.findFirst({
        where: {
            id: farmId,
            ownerId: currentUser.id,
        }
    });

    if (!farmUser && !owner && currentUser.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Period-specific calculations
    const transactions = await prisma.transaction.findMany({
      where: {
        farmId,
        date: {
          gte: startDateObj,
          lte: endDateObj,
        },
      },
    });

    const periodRevenue = transactions
      .filter(t => t.type === 'REVENUE')
      .reduce((sum, t) => sum + t.amount, 0);

    const periodExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const periodNetProfit = periodRevenue - periodExpenses;

    // Year-to-date calculations
    const ytdStart = startOfYear(new Date());
    const ytdEnd = endOfYear(new Date());

    const ytdTransactions = await prisma.transaction.findMany({
        where: {
            farmId,
            date: {
                gte: ytdStart,
                lte: ytdEnd,
            },
        },
    });

    const ytdRevenue = ytdTransactions
      .filter(t => t.type === 'REVENUE')
      .reduce((sum, t) => sum + t.amount, 0);

    const ytdExpenses = ytdTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const ytdNetProfit = ytdRevenue - ytdExpenses;

    return NextResponse.json({
        period: {
            revenue: periodRevenue,
            expenses: periodExpenses,
            netProfit: periodNetProfit,
        },
        ytd: {
            revenue: ytdRevenue,
            expenses: ytdExpenses,
            netProfit: ytdNetProfit,
        }
    });

  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
