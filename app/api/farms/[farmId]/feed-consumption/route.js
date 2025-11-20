// app/api/farms/[farmId]/feed-consumption/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have permission to view these records.' }, { status: 403 });
        }

        const records = await prisma.feedConsumption.findMany({
            where: {
                flock: {
                    farmId: farmId,
                },
            },
            include: {
                flock: { select: { name: true } },
                inventoryLot: {
                    select: {
                        inventoryItem: { select: { name: true, unit: true } }
                    }
                },
                recordedBy: { select: { name: true, email: true } }
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(records, { status: 200 });

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to fetch feed consumption records for farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });
        return NextResponse.json({ error: 'Failed to fetch feed consumption records' }, { status: 500 });
    }
}


export async function POST(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findUnique({
            where: { farmId_userId: { farmId, userId: user.id } },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        const { flockId, inventoryItemId, quantityConsumed, date } = await request.json();

        if (!flockId || !inventoryItemId || !quantityConsumed) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const lots = await prisma.inventoryLot.findMany({
            where: {
                inventoryItemId,
                remainingQuantity: { gt: 0 },
            },
            orderBy: {
                purchaseDate: 'asc',
            },
        });

        if (lots.length === 0) {
            return NextResponse.json({ error: 'No stock available for this item.' }, { status: 400 });
        }

        let remainingToConsume = parseFloat(quantityConsumed);

        const consumptionResult = await prisma.$transaction(async (tx) => {
            for (const lot of lots) {
                if (remainingToConsume <= 0) break;

                const quantityFromThisLot = Math.min(lot.remainingQuantity, remainingToConsume);

                await tx.feedConsumption.create({
                    data: {
                        date: new Date(date),
                        quantity: quantityFromThisLot,
                        flockId,
                        inventoryLotId: lot.id,
                        recordedById: user.id,
                    },
                });

                await tx.inventoryLot.update({
                    where: { id: lot.id },
                    data: {
                        remainingQuantity: {
                            decrement: quantityFromThisLot,
                        },
                    },
                });

                remainingToConsume -= quantityFromThisLot;
            }

            if (remainingToConsume > 0) {
                // This means there wasn't enough stock in total
                throw new Error('Not enough stock to consume. Please update inventory.');
            }
        });

        await log({
            level: "INFO",
            message: `User ${user.email} logged ${quantityConsumed} of item ${inventoryItemId} for flock ${flockId}.`,
            userId: user.id,
            meta: { farmId, flockId, inventoryItemId, quantityConsumed },
        });

        return NextResponse.json({ success: true, message: 'Feed consumption logged successfully.' }, { status: 201 });

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to log feed consumption for farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });

        return NextResponse.json({ error: error.message || 'Failed to log feed consumption' }, { status: 500 });
    }
}
