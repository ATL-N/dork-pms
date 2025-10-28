import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getUserFarmRole } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET all users for a farm
export async function GET(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = await params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const farmUsers = await prisma.farmUser.findMany({
      where: { farmId: farmId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return new Response(JSON.stringify(farmUsers), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch farm users:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch farm users' }), { status: 500 });
  }
}

// PUT to update a user's role in a farm
export async function PUT(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, userId } = await params;
  const { role: newRole } = await request.json();

  const currentUserRole = await getUserFarmRole(session.user.id, farmId);
  if (currentUserRole !== 'OWNER' && currentUserRole !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Prevent changing the role of the farm owner
  const targetUserFarm = await prisma.farmUser.findUnique({
    where: { farmId_userId: { farmId, userId } },
  });

  if (targetUserFarm && targetUserFarm.role === 'OWNER') {
    return new Response(JSON.stringify({ error: 'Cannot change the role of the farm owner' }), { status: 403 });
  }

  try {
    const updatedFarmUser = await prisma.farmUser.update({
      where: { farmId_userId: { farmId, userId } },
      data: { role: newRole },
    });
    return new Response(JSON.stringify(updatedFarmUser), { status: 200 });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return new Response(JSON.stringify({ error: 'Failed to update user role' }), { status: 500 });
  }
}

// DELETE to remove a user from a farm
export async function DELETE(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, userId } = await params;

  const currentUserRole = await getUserFarmRole(session.user.id, farmId);
  if (currentUserRole !== 'OWNER' && currentUserRole !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Prevent removing the farm owner
  const targetUserFarm = await prisma.farmUser.findUnique({
    where: { farmId_userId: { farmId, userId } },
  });

  if (targetUserFarm && targetUserFarm.role === 'OWNER') {
    return new Response(JSON.stringify({ error: 'Cannot remove the farm owner' }), { status: 403 });
  }

  try {
    await prisma.farmUser.delete({
      where: { farmId_userId: { farmId, userId } },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to remove user from farm:", error);
    return new Response(JSON.stringify({ error: 'Failed to remove user from farm' }), { status: 500 });
  }
}
