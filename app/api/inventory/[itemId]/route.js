// app/api/inventory/[itemId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { itemId } = await params;
    const body = await request.json();

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      select: { farmId: true },
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
      data: body,
    });

    await log(
      'info',
      `Inventory item ${updatedItem.name} (ID: ${itemId}) updated by user ${currentUser.email}`,
      { farmId: item.farmId, itemId, userId: currentUser.id },
    );

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    await log(
      'error',
      `Failed to update inventory item ID: ${itemId}`,
      { error: error.message, userId: currentUser.id },
    );
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}