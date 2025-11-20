// app/api/farms/[farmId]/production-records/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { completeTaskIfDue } from '@/app/lib/taskUtils';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
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

  if (!farmAccess && user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'date';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const records = await prisma.eggProductionRecord.findMany({
      where: {
        flock: {
          farmId: farmId,
        },
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        flock: true,
        recordedBy: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: page * limit,
      take: limit,
    });

    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch egg production records:", error);
    return NextResponse.json({ error: 'Failed to fetch egg production records' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { farmId } = await params;
  const user = await getCurrentUser(request);

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
    const { flockId, totalEggs, brokenEggs, notes, date } = body;

    if (!flockId || totalEggs === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const flock = await prisma.flock.findUnique({
      where: { id: flockId },
    });

    if (!flock || flock.farmId !== farmId) {
      return NextResponse.json({ error: 'Flock not found in this farm' }, { status: 404 });
    }

    const [newRecord, farmSummary] = await prisma.$transaction([
      prisma.eggProductionRecord.create({
        data: {
          id: body.id, // Use the ID from the request body
          flockId,
          date: date ? new Date(date) : new Date(),
          totalEggs: parseInt(totalEggs, 10),
          brokenEggs: brokenEggs ? parseInt(brokenEggs, 10) : 0,
          notes,
          recordedById: user.id,
        },
      }),
      prisma.farmSummary.upsert({
        where: { farmId },
        update: {
          totalEggsAvailable: {
            increment: parseInt(totalEggs, 10),
          },
        },
        create: {
          farmId,
          totalEggsAvailable: parseInt(totalEggs, 10),
        },
      }),
    ]);

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
