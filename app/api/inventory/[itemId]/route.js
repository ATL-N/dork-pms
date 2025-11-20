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

  const { itemId } = await params; // Moved outside the try block

  try {
    let body = {};
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 0) {
      body = await request.json();
    }

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

    // If body is empty, it might be a simple stock update, so we only update what's there.
    // If the body has content, we use it.
    const dataToUpdate = {};
    if (body.name) dataToUpdate.name = body.name;
    if (body.category) dataToUpdate.category = body.category;
    if (body.currentStock !== undefined) dataToUpdate.currentStock = parseFloat(body.currentStock);
    if (body.unit) dataToUpdate.unit = body.unit;
    if (body.lowStockThreshold !== undefined) dataToUpdate.lowStockThreshold = body.lowStockThreshold === null ? null : parseFloat(body.lowStockThreshold);
    if (body.supplier) dataToUpdate.supplier = body.supplier;
    if (body.price !== undefined) dataToUpdate.price = body.price === null ? null : parseFloat(body.price);
    if (body.status) dataToUpdate.status = body.status;


    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 200 });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: dataToUpdate,
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