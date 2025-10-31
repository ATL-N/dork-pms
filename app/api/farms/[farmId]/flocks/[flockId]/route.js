// app/api/farms/[farmId]/flocks/[flockId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { z } from 'zod';

const prisma = new PrismaClient();

const routeContextSchema = z.object({
  params: z.object({
    farmId: z.string(),
    flockId: z.string(),
  }),
});

export async function GET(req, {params}) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { flockId, farmId } = await params;
    
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    const farmUser = await prisma.farmUser.findFirst({ where: { farmId: farmId, userId: currentUser.id } });

    if (!farm || (farm.ownerId !== currentUser.id && !farmUser && currentUser.userType !== 'ADMIN')) {
        await logAction('WARN', `User ${currentUser.id} unauthorized to view flock ${flockId}.`);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const flock = await prisma.flock.findUnique({
      where: {
        id: params.flockId,
        farmId: params.farmId,
      },
      include: {
        growthRecords: { orderBy: { date: 'asc' } },
        vaccinationRecords: { orderBy: { date: 'asc' } },
        mortalityRecords: { orderBy: { date: 'asc' } },
        feedConsumption: { orderBy: { date: 'asc' } },
        eggProductionRecords: { orderBy: { date: 'asc' } },
        birdResales: { orderBy: { date: 'asc' } },
      },
    });

    if (!flock) {
      await logAction('WARN', `User ${currentUser.id} failed to find flock ${flockId}.`);
      return NextResponse.json({ error: 'Flock not found' }, { status: 404 });
    }

    await logAction('INFO', `User ${currentUser.id} viewed details for flock ${flockId}.`, { userId: currentUser.id, farmId: farmId });
    return NextResponse.json(flock);

  } catch (error) {
    console.error('Error fetching flock details:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, context) {
    const { params } = routeContextSchema.parse(context);
    const { farmId, flockId } = params;
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { params } = routeContextSchema.parse(context);
        const { farmId, flockId } = params;
        
        const farm = await prisma.farm.findUnique({ where: { id: farmId } });
        const farmUser = await prisma.farmUser.findFirst({ where: { farmId: farmId, userId: currentUser.id, role: { in: ['OWNER', 'MANAGER'] } } });

        if (!farm || (farm.ownerId !== currentUser.id && !farmUser && currentUser.userType !== 'ADMIN')) {
            await logAction('WARN', `User ${currentUser.id} unauthorized to edit flock ${flockId}.`);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        
        const updatedFlock = await prisma.flock.update({
            where: {
                id: flockId,
            },
            data: body,
        });

        await logAction('INFO', `User ${currentUser.id} updated flock ${flockId}.`, { userId: currentUser.id, farmId: farmId, changes: body });
        return NextResponse.json(updatedFlock);

    } catch (error) {
        console.error('Error updating flock:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
