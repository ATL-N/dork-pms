import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getUserFarmRole } from '../../../../../lib/auth';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, inventoryItemId } = params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const data = await request.json();

  try {
    const updatedInventoryItem = await prisma.inventoryItem.update({
      where: { id: inventoryItemId, farmId: farmId },
      data: data,
    });
    return new Response(JSON.stringify(updatedInventoryItem), { status: 200 });
  } catch (error) {
    console.error("Failed to update inventory item:", error);
    return new Response(JSON.stringify({ error: 'Failed to update inventory item' }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, inventoryItemId } = params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    await prisma.inventoryItem.delete({
      where: { id: inventoryItemId, farmId: farmId },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return new Response(JSON.stringify({ error: 'Failed to delete inventory item' }), { status: 500 });
  }
}
