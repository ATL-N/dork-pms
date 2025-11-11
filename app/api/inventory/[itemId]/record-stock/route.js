// app/api/inventory/[itemId]/record-stock/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { itemId } = await params;

  try {
    const body = await request.json();
    const { quantityToAdd, newPrice } = body;

    if (quantityToAdd == null || newPrice == null) {
      return NextResponse.json({ error: 'Missing quantityToAdd or newPrice' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Check user permission
    const userFarm = await prisma.farmUser.findFirst({
      where: {
        userId: currentUser.id,
        farmId: item.farmId,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    });

    if (!userFarm && currentUser.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        currentStock: {
          increment: parseFloat(quantityToAdd),
        },
        price: parseFloat(newPrice),
      },
    });

    await logAction(
      'info',
      `Recorded new stock for ${updatedItem.name} (ID: ${itemId}) by user ${currentUser.email}`,
      { farmId: item.farmId, itemId, userId: currentUser.id, quantityAdded: quantityToAdd, newPrice },
    );

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Error recording new stock for item ID: ${itemId}`, error);
    await logAction(
      'error',
      `Failed to record new stock for item ID: ${itemId}`,
      { error: error.message, userId: currentUser.id },
    );
    return NextResponse.json({ error: 'Failed to record new stock' }, { status: 500 });
  }
}
