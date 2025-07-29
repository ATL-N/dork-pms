import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { z } from 'zod';
import { createLog } from '@/app/lib/logging';

const prisma = new PrismaClient();

const searchParamsSchema = z.object({
  farmId: z.string().min(1, 'Farm ID is required.'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['EXPENSE', 'REVENUE']).optional(),
  category: z.string().optional(),
});

export async function GET(request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const validation = searchParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const { farmId, startDate, endDate, type, category } = validation.data;

  try {
    const whereClause = {
      farmId,
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (type) {
      whereClause.type = type;
    }
    if (category) {
      whereClause.category = category;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { farmId, type, category, amount, description, vendor, customer, date } = body;

        if (!farmId || !type || !category || !amount || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                farmId,
                type,
                category,
                amount: parseFloat(amount),
                description,
                vendor,
                customer,
                date: new Date(date),
            },
        });
        
        await createLog({
            userId: currentUser.id,
            level: 'INFO',
            message: `User ${currentUser.email} created a new ${type.toLowerCase()} transaction of ${amount} in farm ${farmId}.`,
            meta: {
                farmId,
                transactionId: newTransaction.id,
                type,
                amount,
            }
        });

        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        console.error(`Error creating transaction:`, error);
        await createLog({
            userId: currentUser.id,
            level: 'ERROR',
            message: `Failed to create transaction for user ${currentUser.email}.`,
            meta: { error: error.message }
        });
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
