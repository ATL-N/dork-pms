import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { farmId, category, amount, description, vendor, date } = await request.json();

    if (!farmId || !category || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        farmId,
        type: 'EXPENSE',
        category,
        amount: parseFloat(amount),
        description,
        vendor,
        date: new Date(date),
      },
    });

    await log(
      'INFO',
      `User ${user.id} created an expense of ${amount} for farm ${farmId}`,
      {
        userId: user.id,
        farmId,
        transactionId: transaction.id,
      },
    );

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating expense:', error);
    await log(
        'ERROR',
        `Error creating expense for user ${user.id}: ${error.message}`,
        {
            userId: user.id,
            stack: error.stack
        }
    )
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
