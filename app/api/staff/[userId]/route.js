import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

// PUT /api/staff/[userId]
// Updates a user's role on a specific farm
export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const { farmId, role } = await request.json();

    if (!farmId || !role) {
      return NextResponse.json({ error: 'Farm ID and role are required' }, { status: 400 });
    }

    // Authorization: Check if current user is OWNER or MANAGER of the farm
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    const userAccess = await prisma.farmUser.findFirst({
        where: { farmId: farmId, userId: currentUser.id }
    });

    const canManageStaff = farm?.ownerId === currentUser.id || userAccess?.role === 'MANAGER';

    if (!canManageStaff) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Prevent owner from changing their own role or being removed via this endpoint
    if (farm?.ownerId === userId) {
        return NextResponse.json({ error: 'Cannot change the owner\'s role' }, { status: 400 });
    }

    const updatedFarmUser = await prisma.farmUser.update({
      where: {
        farmId_userId: {
          farmId: farmId,
          userId: userId,
        },
      },
      data: {
        role: role,
      },
    });

    return NextResponse.json(updatedFarmUser);
  } catch (error) {
    console.error(`Error updating role for user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// DELETE /api/staff/[userId]
// Removes a user from a specific farm
export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    if (!farmId) {
      return NextResponse.json({ error: 'Farm ID is required' }, { status: 400 });
    }

    // Authorization: Check if current user is OWNER or MANAGER of the farm
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    const userAccess = await prisma.farmUser.findFirst({
        where: { farmId: farmId, userId: currentUser.id }
    });

    const canManageStaff = farm?.ownerId === currentUser.id || userAccess?.role === 'MANAGER';

    if (!canManageStaff) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent owner from being removed from their own farm
    if (farm?.ownerId === userId) {
        return NextResponse.json({ error: 'Cannot remove the owner from the farm' }, { status: 400 });
    }

    await prisma.farmUser.delete({
      where: {
        farmId_userId: {
          farmId: farmId,
          userId: userId,
        },
      },
    });

    return NextResponse.json({ message: 'User removed from farm successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error removing user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
