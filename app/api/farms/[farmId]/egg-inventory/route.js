// app/api/farms/[farmId]/egg-inventory/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { farmId } = params;
  const user = await getCurrentUser();

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

  if (!farmAccess && user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const totalEggsProduced = await prisma.eggProductionRecord.aggregate({
      _sum: {
        totalEggs: true,
      },
      where: {
        flock: {
          farmId: farmId,
        },
      },
    });

    const totalEggsSold = await prisma.eggSale.aggregate({
        _sum: {
            quantity: true,
        },
        where: {
            farmId: farmId,
        },
    });

    const availableEggs = (totalEggsProduced._sum.totalEggs || 0) - (totalEggsSold._sum.quantity || 0);

    return NextResponse.json({ availableEggs });

  } catch (error) {
    console.error("Failed to fetch egg inventory:", error);
    await logAction('ERROR', `Failed to fetch egg inventory for farm ${farmId}. Error: ${error.message}`, {
      userId: user.id,
      farmId,
      error: error.stack,
    });
    return NextResponse.json({ error: 'Failed to fetch egg inventory' }, { status: 500 });
  }
}
