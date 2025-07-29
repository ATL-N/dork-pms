// app/api/farms/[farmId]/vaccination-records/route.js
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

async function canUserAccessFarm(userId, farmId) {
  if (!userId) return false;
  const farmUser = await prisma.farmUser.findUnique({
    where: {
      userId_farmId: { userId, farmId },
    },
  });
  return !!farmUser;
}

export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = params;
  const hasAccess = await canUserAccessFarm(user.id, farmId);

  if (!hasAccess) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const records = await prisma.vaccinationRecord.findMany({
      where: {
        flock: {
          farmId: farmId,
        },
      },
      include: {
        flock: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    await logAction('INFO', `User ${user.id} fetched vaccination records for farm ${farmId}`);
    return new Response(JSON.stringify(records), { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch vaccination records for farm ${farmId}:`, error);
    await logAction('ERROR', `Failed to fetch vaccination records for farm ${farmId}`, { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to fetch records' }), { status: 500 });
  }
}