import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser(request);

  if (!user || user.userType !== 'ADMIN') {
    await logAction('WARN', 'Forbidden access to all farms', { userId: user?.id, ip: request.ip });
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const farms = await prisma.farm.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        users: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    await logAction('INFO', 'Fetched all farms', { userId: user.id });
    return new Response(JSON.stringify(farms), { status: 200 });
  } catch (error) {
    await logAction('ERROR', 'Failed to fetch all farms', { userId: user.id, error: error.message });
    console.error("Failed to fetch all farms:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch farms' }), { status: 500 });
  }
}
