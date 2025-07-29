import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { farmId, category, amount, description, customer, date } = await request.json();

    if (!farmId || !category || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        farmId,
        type: 'REVENUE',
        category,
        amount: parseFloat(amount),
        description,
        customer,
        date: new Date(date),
      },
    });

    await log({
      level: 'info',
      message: `User ${user.id} created a revenue of ${amount} for farm ${farmId}`,
      userId: user.id,
      meta: {
        farmId,
        transactionId: transaction.id,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating revenue:', error);
    await log({
        level: 'error',
        message: `Error creating revenue for user ${user.id}: ${error.message}`,
        userId: user.id,
        meta: {
            stack: error.stack
        }
    })
    return NextResponse.json({ error: 'Failed to create revenue' }, { status: 500 });
  }
}
