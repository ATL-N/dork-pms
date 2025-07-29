// app/api/farms/[farmId]/vet-access/route.js
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

async function getUserFarmRole(userId, farmId) {
  if (!userId) return null;
  return await prisma.farmUser.findUnique({
    where: {
      farmId_userId: { farmId, userId },
    },
  });
}

export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = await params;
  const farmUser = await getUserFarmRole(user.id, farmId);

  if (!farmUser) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const vetAccesses = await prisma.VetFarmAccess.findMany({
      where: { farmId: farmId, status: 'ACTIVE' },
      include: {
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await logAction('INFO', `User ${user.id} fetched vet access list for farm ${farmId}`);
    return new Response(JSON.stringify(vetAccesses), { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch vet access list for farm ${farmId}:`, error);
    await logAction('ERROR', `Failed to fetch vet access list for farm ${farmId}`, { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to fetch vet access list' }), { status: 500 });
  }
}
