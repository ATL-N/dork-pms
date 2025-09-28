// app/api/farms/[farmId]/production-records/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { completeTaskIfDue } from '@/app/lib/taskUtils';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const { farmId } = params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user has access to this farm
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
    const body = await request.json();
    const { flockId, totalEggs, brokenEggs, notes } = body;

    if (!flockId || totalEggs === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const flock = await prisma.flock.findUnique({
      where: { id: flockId },
    });

    if (!flock || flock.farmId !== farmId) {
      return NextResponse.json({ error: 'Flock not found in this farm' }, { status: 404 });
    }

    const newRecord = await prisma.eggProductionRecord.create({
      data: {
        flockId,
        date: new Date(),
        totalEggs: parseInt(totalEggs, 10),
        brokenEggs: brokenEggs ? parseInt(brokenEggs, 10) : 0,
        notes,
      },
    });

    await logAction('INFO', `User ${user.id} recorded egg production for flock ${flockId}.`, { userId: user.id, farmId, flockId, recordId: newRecord.id });

    // Attempt to complete a related task
    await completeTaskIfDue(flockId, 'Record Egg Production', new Date());

    return NextResponse.json(newRecord, { status: 201 });

  } catch (error) {
    console.error("Failed to record egg production:", error);
    await logAction('ERROR', `Failed to record egg production for farm ${farmId}. Error: ${error.message}`, { userId: user.id, farmId, error: error.stack });
    return NextResponse.json({ error: 'Failed to record egg production' }, { status: 500 });
  }
}
