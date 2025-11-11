// app/api/farms/[farmId]/flocks/[flockId]/feed-consumption/[recordId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    const { recordId } = await params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findFirst({
            where: {
                userId: currentUser.id,
                farm: {
                    flocks: {
                        some: {
                            feedConsumption: {
                                some: { id: recordId }
                            }
                        }
                    }
                },
                role: { in: ['OWNER', 'MANAGER'] },
            },
        });

        const recordForFarm = await prisma.feedConsumption.findFirst({
            where: {
                id: recordId,
                flock: {
                    farm: {
                        ownerId: currentUser.id,
                    }
                }
            }
        });

        if (!recordForFarm && !farmUser && currentUser.userType !== 'ADMIN') {
            await logAction('WARN', `User ${currentUser.id} unauthorized to edit feed consumption record ${recordId}.`);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { quantity, feedItemId } = body;

        const updatedRecord = await prisma.feedConsumption.update({
            where: { id: recordId },
            data: {
                quantity: quantity ? parseFloat(quantity) : undefined,
                feedItemId: feedItemId,
            },
        });

        await logAction('INFO', `User ${currentUser.id} updated feed consumption record ${recordId}.`, { userId: currentUser.id, recordId: recordId });
        return NextResponse.json(updatedRecord, { status: 200 });

    } catch (error) {
        console.error("Failed to update feed consumption record:", error);
        await logAction('ERROR', `Failed to update feed consumption record ${recordId}. Error: ${error.message}`, { userId: currentUser.id, recordId: recordId, error: error.stack });
        return NextResponse.json({ error: 'Failed to update feed consumption record' }, { status: 500 });
    }
}


export async function DELETE(request, { params }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { farmId, flockId, recordId } = await params;

  try {
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId: farmId,
        userId: currentUser.id,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    });

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });

    if (!farm || (farm.ownerId !== currentUser.id && !farmUser && currentUser.userType !== 'ADMIN')) {
      await logAction('WARN', `User ${currentUser.id} unauthorized to delete feed consumption record ${recordId}.`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Optional: Check if the flock belongs to the farm
    const flock = await prisma.flock.findFirst({
        where: { id: flockId, farmId: farmId }
    });

    if (!flock) {
        return NextResponse.json({ error: 'Flock not found in this farm' }, { status: 404 });
    }

    // Get the original record to adjust inventory
    const originalRecord = await prisma.feedConsumption.findUnique({
        where: { id: recordId },
    });

    if (!originalRecord) {
        return NextResponse.json({ error: 'Feed consumption record not found' }, { status: 404 });
    }


    await prisma.$transaction(async (tx) => {
        // Delete the record
        await tx.feedConsumption.delete({
            where: { id: recordId },
        });

        // Add the consumed quantity back to the inventory
        await tx.inventoryItem.update({
            where: { id: originalRecord.feedItemId },
            data: {
                currentStock: {
                    increment: originalRecord.quantity,
                },
            },
        });
    });

    await logAction('INFO', `User ${currentUser.id} deleted feed consumption record ${recordId}.`, { userId: currentUser.id, farmId: farmId, flockId: flockId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting feed consumption record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}