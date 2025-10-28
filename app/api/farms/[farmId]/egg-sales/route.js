// app/api/farms/[farmId]/egg-sales/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const { farmId } = await params;
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const farmAccess = await prisma.farmUser.findUnique({
    where: {
      farmId_userId: {
        farmId: farmId,
        userId: user.id,
      },
    },
  });

  const canCreate = farmAccess && ['OWNER', 'MANAGER'].includes(farmAccess.role);

  if (!canCreate && user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { quantity, amount, date, customer, notes } = body;

    if (!quantity || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check inventory
    const totalEggsProduced = await prisma.eggProductionRecord.aggregate({
      _sum: { totalEggs: true },
      where: { flock: { farmId } },
    });
    const totalEggsSold = await prisma.eggSale.aggregate({
      _sum: { quantity: true },
      where: { farmId },
    });
    const availableEggs = (totalEggsProduced._sum.totalEggs || 0) - (totalEggsSold._sum.quantity || 0);

    if (quantity > availableEggs) {
      return NextResponse.json({ error: `Sale quantity (${quantity}) exceeds available eggs (${availableEggs}).` }, { status: 400 });
    }

    // Use a transaction to ensure both the sale and revenue are created
    const newSale = await prisma.$transaction(async (tx) => {
      const eggSale = await tx.eggSale.create({
        data: {
          farmId,
          quantity: parseInt(quantity),
          amount: parseFloat(amount),
          date: new Date(date),
          customer: customer || 'N/A',
          notes: notes || '',
          recordedById: user.id,
        },
      });

      await tx.revenue.create({
        data: {
          farmId,
          amount: parseFloat(amount),
          date: new Date(date),
          category: 'Egg Sales',
          customer: customer || 'N/A',
          description: `Sale of ${quantity} eggs.`,
          eggSaleId: eggSale.id,
        },
      });

      return eggSale;
    });

    await logAction('INFO', `User ${user.id} recorded an egg sale of ${quantity} eggs for ${amount}.`, {
      userId: user.id,
      farmId,
      eggSaleId: newSale.id,
    });

    return NextResponse.json(newSale, { status: 201 });

  } catch (error) {
    console.error("Failed to record egg sale:", error);
    await logAction('ERROR', `Failed to record egg sale for farm ${farmId}. Error: ${error.message}`, {
      userId: user.id,
      farmId,
      error: error.stack,
    });
    return NextResponse.json({ error: 'Failed to record egg sale' }, { status: 500 });
  }
}
