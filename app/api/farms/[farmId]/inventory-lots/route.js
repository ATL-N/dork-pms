// app/api/farms/[farmId]/inventory-lots/route.js
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
        // 1. Verify user has access to the farm
        const farmUser = await prisma.farmUser.findUnique({
            where: { farmId_userId: { farmId, userId: user.id } },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        // 2. Fetch all active inventory items for the farm
        const inventoryItems = await prisma.inventoryItem.findMany({
            where: { farmId, status: 'active' },
            orderBy: { name: 'asc' },
        });

        // 3. Fetch all lots associated with those items
        const itemIds = inventoryItems.map(item => item.id);
        const inventoryLots = await prisma.inventoryLot.findMany({
            where: {
                inventoryItemId: { in: itemIds },
            },
            orderBy: { purchaseDate: 'asc' },
        });

        // 4. Return the raw data in the format the client expects
        return NextResponse.json({ items: inventoryItems, lots: inventoryLots });

    } catch (error) {
        await log(
            "ERROR",
            `Failed to fetch inventory data for farm ${farmId}. Error: ${error.message}`,
            { farmId, userId: user.id, stack: error.stack },
        );
        return NextResponse.json({ error: 'Failed to fetch inventory data' }, { status: 500 });
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

        const data = await request.json();
        const {
            inventoryItemId: clientInventoryItemId, // Use client-provided ID
            lotId: clientLotId,                   // Use client-provided ID
            name,
            category,
            consumptionUnit,
            purchaseDate,
            supplier,
            initialQuantity,
            purchaseUnit,
            totalCost,
            unitConversionFactor
        } = data;

        if (!name || !category || !consumptionUnit || !initialQuantity || !purchaseUnit || !totalCost) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newLot = await prisma.$transaction(async (tx) => {
            // 1. Find or create the parent InventoryItem
            let inventoryItem = await tx.inventoryItem.findFirst({
                where: { farmId, name, category },
            });

            if (!inventoryItem) {
                inventoryItem = await tx.inventoryItem.create({
                    data: {
                        id: clientInventoryItemId, // Use client-provided ID
                        farmId,
                        name,
                        category,
                        unit: consumptionUnit,
                    },
                });
            }

            // 2. Create the new InventoryLot
            const newLot = await tx.inventoryLot.create({
                data: {
                    id: clientLotId, // Use client-provided ID
                    inventoryItemId: inventoryItem.id,
                    purchaseDate: new Date(purchaseDate),
                    supplier,
                    initialQuantity: parseFloat(initialQuantity),
                    remainingQuantity: parseFloat(initialQuantity),
                    unit: purchaseUnit,
                    totalCost: parseFloat(totalCost),
                    unitConversionFactor: unitConversionFactor ? parseFloat(unitConversionFactor) : 1,
                },
            });

            // 3. Create a corresponding expense transaction
            await tx.transaction.create({
                data: {
                    farmId,
                    date: new Date(purchaseDate),
                    type: 'EXPENSE',
                    category: 'Inventory Procurement',
                    amount: parseFloat(totalCost),
                    description: `Purchased ${initialQuantity} ${purchaseUnit} of ${name}`,
                    vendor: supplier,
                },
            });

            return newLot;
        });

        await log(
            "INFO",
            `User ${user.email} recorded new stock for '${name}' in farm ${farmId}.`,
            { farmId, userId: user.id, lotId: newLot.id, itemName: name },
        );

        return NextResponse.json(newLot, { status: 201 });

    } catch (error) {
        await log(
            "ERROR",
            `Failed to record new stock for farm ${farmId}. Error: ${error.message}`,
            { farmId, userId: user.id, stack: error.stack },
        );

        return NextResponse.json({ error: 'Failed to record new stock' }, { status: 500 });
    }
}
