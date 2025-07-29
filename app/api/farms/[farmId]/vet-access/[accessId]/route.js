// app/api/farms/[farmId]/vet-access/[accessId]/route.js
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

async function getUserFarmRole(userId, farmId) {
  if (!userId) return null;
  return await prisma.farmUser.findUnique({
    where: {
      userId_farmId: { userId, farmId },
    },
  });
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, accessId } = params;
  const farmUser = await getUserFarmRole(user.id, farmId);

  if (!farmUser || !['OWNER', 'MANAGER'].includes(farmUser.role)) {
    return new Response(JSON.stringify({ error: 'Forbidden: Only owners or managers can revoke access.' }), { status: 403 });
  }

  try {
    const accessToDelete = await prisma.vetAccess.findUnique({
        where: { id: accessId }
    });

    if (!accessToDelete || accessToDelete.farmId !== farmId) {
        return new Response(JSON.stringify({ error: 'Vet access record not found in this farm.' }), { status: 404 });
    }

    await prisma.vetAccess.delete({
      where: { id: accessId },
    });

    await logAction('DELETE', `User ${user.id} revoked vet access ${accessId} for farm ${farmId}`);
    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to revoke vet access for farm ${farmId}:`, error);
    await logAction('ERROR', `Failed to revoke vet access ${accessId} for farm ${farmId}`, { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to revoke access' }), { status: 500 });
  }
}