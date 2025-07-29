// app/api/farms/[farmId]/financials/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { z } from 'zod';

const prisma = new PrismaClient();

const routeContextSchema = z.object({
  params: z.object({
    farmId: z.string(),
  }),
});

export async function GET(req, context) {
  try {
    const { params } = routeContextSchema.parse(context);
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const farmUser = await prisma.farmUser.findUnique({
      where: {
        farmId_userId: {
          farmId: params.farmId,
          userId: currentUser.id,
        },
      },
    });
    
    const farm = await prisma.farm.findUnique({
        where: { id: params.farmId }
    })

    if (!farmUser && farm.ownerId !== currentUser.id && currentUser.userType !== 'ADMIN') {
      return new Response("You don't have access to this farm", { status: 403 });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyRevenues = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        farmId: params.farmId,
        type: 'REVENUE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyExpenses = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        farmId: params.farmId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const totalRevenue = monthlyRevenues._sum.amount || 0;
    const totalExpenses = monthlyExpenses._sum.amount || 0;
    const profit = totalRevenue - totalExpenses;

    const summary = {
      revenue: {
        monthly: totalRevenue,
      },
      expenses: {
        monthly: totalExpenses,
      },
      profit: {
        monthly: profit,
      },
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
