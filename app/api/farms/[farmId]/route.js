import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFarmRole } from '@/app/lib/auth';
import { logAction } from '@/app/lib/logging';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

// GET farm data
export async function GET(request, { params }) {
  const session = await getCurrentUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { farmId } = await params;
  const userId = session.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    return NextResponse.json({ error: 'User not found or deleted' }, { status: 404 });
  }

  const role = await getUserFarmRole(userId, farmId);
  if (!role && user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json(farm);
  } catch (error) {
    console.error('Failed to fetch farm:', error);
    return NextResponse.json({ error: 'Failed to fetch farm' }, { status: 500 });
  }
}

// PUT to update farm data (including approvals and custom schedules)
export async function PUT(request, { params }) {
  const session = await getCurrentUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { farmId } = await params;
  const userId = session.id;
  const body = await request.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    return NextResponse.json({ error: 'User not found or deleted' }, { status: 404 });
  }

  const role = await getUserFarmRole(userId, farmId);
  if (user.userType !== 'ADMIN' && role !== 'OWNER' && role !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, location, ownerApprovalStatus, useCustomSchedule } = body;
    
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (location) dataToUpdate.location = location;
    if (typeof useCustomSchedule === 'boolean') dataToUpdate.useCustomSchedule = useCustomSchedule;
    if (ownerApprovalStatus) {
        dataToUpdate.owner = {
            update: {
                ownerApprovalStatus,
            },
        };
    }

    const updatedFarm = await prisma.farm.update({
      where: { id: farmId },
      data: dataToUpdate,
    });

    await logAction('INFO', `Farm ${farmId} updated by user ${userId}`, { userId, farmId, changes: body });

    return NextResponse.json(updatedFarm);
  } catch (error) {
    console.error('Failed to update farm:', error);
    await logAction('ERROR', `Failed to update farm ${farmId} by user ${userId}`, { userId, farmId, error: error.message });
    return NextResponse.json({ error: 'Failed to update farm' }, { status: 500 });
  }
}
