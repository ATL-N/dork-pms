// app/api/farms/[farmId]/inventory-items/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findUnique({
            where: {
                farmId_userId: {
                    farmId,
                    userId: user.id,
                },
            },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const categories = searchParams.getAll('category');

        const whereClause = {
            farmId,
        };

        if (categories.length > 0) {
            whereClause.category = {
                in: categories,
            };
        }

        const inventoryItems = await prisma.inventoryItem.findMany({
            where: whereClause,
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(inventoryItems);

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to fetch inventory items for farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });
        return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}


export async function POST(request, { params }) {
    const { farmId } = params;
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findUnique({
            where: {
                farmId_userId: {
                    farmId,
                    userId: user.id,
                },
            },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        const data = await request.json();
        const { name, category, currentStock, unit, minThreshold, supplier } = data;

        if (!name || !category || currentStock === undefined || !unit) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newItem = await prisma.inventoryItem.create({
            data: {
                farmId,
                name,
                category,
                currentStock: parseFloat(currentStock),
                unit,
                minThreshold: minThreshold ? parseFloat(minThreshold) : null,
                supplier: supplier || null,
            },
        });

        await log({
            level: "INFO",
            message: `User ${user.email} created new inventory item '${name}' in farm ${farmId}.`,
            userId: user.id,
            meta: { farmId, itemName: name, category },
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to create inventory item for farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });

        return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}