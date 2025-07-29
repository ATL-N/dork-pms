// app/api/inventory/[itemId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { itemId } = params;
  const { status } = await request.json();

  if (status !== 'archived') {
    return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
  }

  try {
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
      data: { status: 'archived' },
    });

    await log({
      level: 'info',
      message: `Inventory item ${updatedItem.name} (ID: ${itemId}) archived by user ${currentUser.email}`,
      userId: currentUser.id,
      meta: { farmId: item.farmId, itemId },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error archiving inventory item:', error);
    await log({
      level: 'error',
      message: `Failed to archive inventory item ID: ${itemId}`,
      userId: currentUser.id,
      meta: { error: error.message },
    });
    return NextResponse.json({ error: 'Failed to archive inventory item' }, { status: 500 });
  }
}