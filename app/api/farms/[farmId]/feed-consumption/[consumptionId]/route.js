
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getUserFarmRole } from '../../../../../lib/auth';

const prisma = new PrismaClient();

// UPDATE a specific feed consumption record
export async function PUT(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, consumptionId } = await params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (!role) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const updatedRecord = await prisma.feedConsumption.update({
      where: { id: consumptionId },
      data: body,
    });
    // TODO: Adjust inventory based on the change in consumption
    return new Response(JSON.stringify(updatedRecord), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update consumption record' }), { status: 500 });
  }
}

// DELETE a specific feed consumption record
export async function DELETE(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, consumptionId } = await params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    // TODO: Adjust inventory when deleting a consumption record
    await prisma.feedConsumption.delete({
      where: { id: consumptionId },
    });
    return new Response(null, { status: 204 }); // No content
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete consumption record' }), { status: 500 });
  }
}
