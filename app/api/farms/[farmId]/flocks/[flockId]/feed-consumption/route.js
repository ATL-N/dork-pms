// app/api/farms/[farmId]/flocks/[flockId]/feed-consumption/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId, flockId } = params;
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
                flockId: flockId,
            },
            orderBy: {
                date: 'asc',
            },
        });

        return NextResponse.json(records, { status: 200 });

    } catch (error) {
        await logAction(
            "ERROR",
            `Failed to fetch feed consumption records for flock ${flockId}. Error: ${error.message}`,
            { farmId, flockId, stack: error.stack, userId: user.id }
        );
        return NextResponse.json({ error: 'Failed to fetch feed consumption records' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    console.log('[DEBUG] Received params:', params);
    const { farmId, flockId } = await params;
    console.log('[DEBUG] Destructured params:', { farmId, flockId });
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have permission to perform this action.' }, { status: 403 });
        }

        const data = await request.json();
        console.log('[DEBUG] Received data:', data);
        const { id, feedItemId, quantity, date, recordedById } = data;

        if (!id || !feedItemId || !quantity || !date || !recordedById) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const inventoryItem = await tx.inventoryItem.findUnique({
                where: { id: feedItemId },
            });

            if (!inventoryItem) {
                throw new Error('Inventory item not found.');
            }

            if (inventoryItem.currentStock < quantity) {
                throw new Error(`Not enough stock for ${inventoryItem.name}.`);
            }

            await tx.inventoryItem.update({
                where: { id: feedItemId },
                data: {
                    currentStock: {
                        decrement: parseFloat(quantity),
                    },
                },
            });

            const newRecord = await tx.feedConsumption.create({
                data: {
                    id,
                    flockId,
                    feedItemId,
                    quantity: parseFloat(quantity),
                    date: new Date(date),
                    recordedById,
                },
            });

            return newRecord;
        });

        await logAction(
            "INFO",
            `User ${user.email} recorded feed consumption for flock ${flockId}.`,
            { farmId, flockId, feedConsumptionId: result.id, userId: user.id }
        );

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('[ERROR] Full error object:', error);
        console.error('[ERROR] Error message:', error.message);
        console.error('[ERROR] Error stack:', error.stack);
        
        await logAction(
            "ERROR",
            `Failed to record feed consumption for flock ${flockId}. Error: ${error.message}`,
            { farmId, flockId, stack: error.stack, userId: user.id }
        );
        return NextResponse.json({ error: error.message || 'Failed to record feed consumption' }, { status: 500 });
    }
}