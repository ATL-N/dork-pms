// app/api/farms/[farmId]/feed-items/[feedItemId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

// PUT to update a feed item
export async function PUT(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId, feedItemId } = await params;
  const data = await request.json();

  try {
    // Authorization check
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.ownerId !== user.id) {
      const farmUser = await prisma.farmUser.findUnique({
        where: {
          farmId_userId: { farmId, userId: user.id },
          role: { in: ['OWNER', 'MANAGER'] },
        },
      });
      if (!farmUser && user.userType !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized to update feed items' }, { status: 403 });
      }
    }

    const updatedFeedItem = await prisma.feedItem.update({
      where: { id: feedItemId },
      data: {
        ...data,
        quantity: data.quantity ? parseFloat(data.quantity) : undefined,
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : undefined,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : (data.expiryDate === null ? null : undefined),
      },
    });

    await logAction('INFO', `Feed item '${updatedFeedItem.name}' updated for farm ${farmId}`, { userId: user.id });

    return NextResponse.json(updatedFeedItem);
  } catch (error) {
    console.error('Error updating feed item:', error);
    await logAction('ERROR', `Error updating feed item ${feedItemId}: ${error.message}`, { userId: user.id });
    return NextResponse.json({ error: 'Failed to update feed item' }, { status: 500 });
  }
}

// DELETE a feed item
export async function DELETE(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId, feedItemId } = await params;

  try {
    // Authorization check
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.ownerId !== user.id) {
      const farmUser = await prisma.farmUser.findUnique({
        where: {
          farmId_userId: { farmId, userId: user.id },
          role: { in: ['OWNER', 'MANAGER'] },
        },
      });
      if (!farmUser && user.userType !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized to delete feed items' }, { status: 403 });
      }
    }
    
    // Check for dependencies before deleting
    const relatedConsumptions = await prisma.feedConsumption.count({ where: { feedItemId } });
    const relatedIngredients = await prisma.formulationIngredient.count({ where: { feedItemId } });

    if (relatedConsumptions > 0 || relatedIngredients > 0) {
        return NextResponse.json({ 
            error: 'Cannot delete feed item. It is currently used in consumption records or formulations. Please archive it instead.' 
        }, { status: 409 });
    }

    const deletedFeedItem = await prisma.feedItem.delete({
      where: { id: feedItemId },
    });

    await logAction('WARN', `Feed item '${deletedFeedItem.name}' (ID: ${feedItemId}) deleted from farm ${farmId}`, { userId: user.id });

    return NextResponse.json({ message: 'Feed item deleted successfully' });
  } catch (error) {
    console.error('Error deleting feed item:', error);
    await logAction('ERROR', `Error deleting feed item ${feedItemId}: ${error.message}`, { userId: user.id });
    return NextResponse.json({ error: 'Failed to delete feed item' }, { status: 500 });
  }
}