// app/api/farms/[farmId]/feed-consumption/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { completeTaskIfDue } from '@/app/lib/taskUtils';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = params;
  const { flockId, feedItemId, quantity, notes } = await request.json();

  if (!flockId || !feedItemId || !quantity) {
    return NextResponse.json({ error: 'Missing required fields: flockId, feedItemId, and quantity are required.' }, { status: 400 });
  }

  try {
    // Authorization: Check if the user can access this farm
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    const farmUser = await prisma.farmUser.findUnique({
      where: { farmId_userId: { farmId, userId: user.id } },
    });

    if (!farm || (farm.ownerId !== user.id && !farmUser && user.userType !== 'ADMIN')) {
      return NextResponse.json({ error: 'Not authorized to access this farm' }, { status: 403 });
    }

    // 1. Create the feed consumption record
    const newConsumption = await prisma.feedConsumption.create({
      data: {
        quantity: parseFloat(quantity),
        notes,
        flockId,
        feedItemId,
        recordedById: user.id,
        // The 'date' field is now set by the database by default
      },
    });

    // 2. Update the feed item's quantity
    const feedItem = await prisma.feedItem.findUnique({ where: { id: feedItemId } });
    if (feedItem) {
      await prisma.feedItem.update({
        where: { id: feedItemId },
        data: {
          quantity: feedItem.quantity - parseFloat(quantity),
        },
      });
    } else {
        // This case should ideally not happen if the frontend is working correctly
        console.warn(`Feed item with ID ${feedItemId} not found after consumption was recorded.`);
    }

    await logAction('INFO', `Recorded feed consumption of ${quantity} for flock ${flockId}`, { userId: user.id, farmId });

    // Attempt to complete a related task
    await completeTaskIfDue(flockId, 'Feed Flock', new Date());

    return NextResponse.json(newConsumption, { status: 201 });
  } catch (error) {
    console.error('Error recording feed consumption:', error);
    await logAction('ERROR', `Error recording feed consumption: ${error.message}`, { userId: user.id, farmId });
    return NextResponse.json({ error: 'Failed to record feed consumption' }, { status: 500 });
  }
}