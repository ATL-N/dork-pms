// app/api/farms/[farmId]/feed-items/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

// GET all feed items for a farm
export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = await params;

  try {
    // Check if user has access to this farm
    const farmUser = await prisma.farmUser.findUnique({
      where: {
        farmId_userId: {
          farmId: farmId,
          userId: user.id,
        },
      },
    });

    if (!farmUser && user.userType !== 'ADMIN') {
      const farm = await prisma.farm.findUnique({ where: { id: farmId } });
      if (!farm || farm.ownerId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    const feedItems = await prisma.feedItem.findMany({
      where: { farmId },
      orderBy: { purchaseDate: 'desc' },
    });

    return NextResponse.json(feedItems);
  } catch (error) {
    console.error('Error fetching feed items:', error);
    return NextResponse.json({ error: 'Failed to fetch feed items' }, { status: 500 });
  }
}

// POST a new feed item to a farm
export async function POST(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = await params;
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
        return NextResponse.json({ error: 'Not authorized to add feed items' }, { status: 403 });
      }
    }

    const newFeedItem = await prisma.feedItem.create({
      data: {
        ...data,
        farmId,
        quantity: parseFloat(data.quantity),
        unitPrice: parseFloat(data.unitPrice),
        purchaseDate: new Date(data.purchaseDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });

    await logAction('INFO', `Feed item '${data.name}' created for farm ${farmId}`, { userId: user.id });

    return NextResponse.json(newFeedItem, { status: 201 });
  } catch (error) {
    console.error('Error creating feed item:', error);
    await logAction('ERROR', `Error creating feed item for farm ${farmId}: ${error.message}`, { userId: user.id });
    return NextResponse.json({ error: 'Failed to create feed item' }, { status: 500 });
  }
}