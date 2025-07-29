// app/api/flocks/route.js
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // First, get all farms the user is associated with
    const farmUsers = await prisma.farmUser.findMany({
      where: { userId: user.id },
      select: { farmId: true },
    });

    const farmIds = farmUsers.map(fu => fu.farmId);

    if (farmIds.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Then, fetch all flocks from those farms
    const flocks = await prisma.flock.findMany({
      where: {
        farmId: {
          in: farmIds,
        },
      },
      include: {
        farm: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    await logAction('INFO', `User ${user.id} fetched all their flocks`);
    await logAction('INFO', `User ${user.id} fetched all their flocks`);
    return new Response(JSON.stringify(flocks), { status: 200 });

  } catch (error) {
    console.error('Failed to fetch flocks for user:', error);
    await logAction('ERROR', `Failed to fetch flocks for user ${user.id}`, { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to fetch flocks' }), { status: 500 });
  }
}
