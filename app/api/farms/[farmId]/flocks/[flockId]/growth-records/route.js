// app/api/farms/[farmId]/flocks/[flockId]/growth-records/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { z } from 'zod';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

const growthRecordSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  weight: z.number().positive('Weight must be a positive number'),
});

export async function POST(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { farmId, flockId } = await params;
    const body = await request.json();

    const validation = growthRecordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const { date, weight } = validation.data;

    // Verify user has access to this farm
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId,
        userId: currentUser.id,
        role: { in: ['OWNER', 'MANAGER', 'WORKER'] },
      },
    });

    if (!farmUser) {
      return NextResponse.json({ error: 'You do not have permission to modify this flock.' }, { status: 403 });
    }

    const newGrowthRecord = await prisma.growthRecord.create({
      data: {
        date,
        weight,
        flockId,
      },
    });
    
    await logAction('CREATE', `User ${currentUser.id} created a new growth record for flock ${flockId}`);

    return NextResponse.json(newGrowthRecord, { status: 201 });
  } catch (error) {
    console.error('Failed to create growth record:', error);
    return NextResponse.json({ error: 'Failed to create growth record' }, { status: 500 });
  }
}
