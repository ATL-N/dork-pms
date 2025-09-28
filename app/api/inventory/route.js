import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

// GET all inventory items for a farm
export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');
    const since = searchParams.get('since');

    if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 });
    }

    const whereClause = {
      farmId: farmId,
      status: 'active',
    };

    if (since) {
      whereClause.updatedAt = {
        gt: new Date(since),
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
    console.error('Error fetching inventory items:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
  }
}

// POST a new inventory item
export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { farmId, name, category, currentStock, unit, minThreshold, supplier } = body;

    if (!farmId || !name || !category || currentStock === undefined || !unit) {
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
        supplier,
      },
    });
    
    await log({
      level: 'info',
      message: `User ${user.id} created inventory item "${name}" for farm ${farmId}`,
      userId: user.id,
      meta: { farmId, itemId: newItem.id },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    await log({
        level: 'error',
        message: `Error creating inventory item for user ${user.id}: ${error.message}`,
        userId: user.id,
        meta: { stack: error.stack },
    });
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
