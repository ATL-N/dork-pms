// app/api/farms/[farmId]/flocks/[flockId]/feed-consumption/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

export async function POST(request, { params }) {
    const { farmId, flockId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        // Authorize user
        const farmUser = await prisma.farmUser.findUnique({
            where: { farmId_userId: { farmId, userId: user.id } },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        const data = await request.json();
        const {
            id: consumptionId,
            inventoryLotId,
            quantity,
            date,
            recordedById
        } = data;

        if (!consumptionId || !inventoryLotId || !quantity || !date || !recordedById) {
            return NextResponse.json({ error: 'Missing required fields in payload' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get the inventory lot to ensure it exists and has enough stock
            const lot = await tx.inventoryLot.findUnique({
                where: { id: inventoryLotId },
            });

            if (!lot) {
                throw new Error(`Inventory lot with ID ${inventoryLotId} not found.`);
            }

            if (lot.remainingQuantity < quantity) {
                throw new Error(`Not enough stock in lot ${inventoryLotId}. Available: ${lot.remainingQuantity}, Required: ${quantity}`);
            }

            // 2. Create the feed consumption record
            const newConsumption = await tx.feedConsumption.create({
                data: {
                    id: consumptionId,
                    flockId,
                    inventoryLotId,
                    quantity,
                    date: new Date(date),
                    recordedById,
                },
            });

            // 3. Update the inventory lot's remaining quantity
            await tx.inventoryLot.update({
                where: { id: inventoryLotId },
                data: {
                    remainingQuantity: {
                        decrement: quantity,
                    },
                },
            });

            return newConsumption;
        });

        await logAction(
            'INFO',
            `User ${user.email} recorded feed consumption of ${quantity} for flock ${flockId}`,
            { farmId, flockId, consumptionId: result.id }
        );

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('Failed to record feed consumption:', error);
        await logAction(
            'ERROR',
            `Failed to record feed consumption for flock ${flockId}. Error: ${error.message}`,
            { farmId, flockId, stack: error.stack }
        );
        return NextResponse.json({ error: `Failed to record feed consumption: ${error.message}` }, { status: 500 });
    }
}
