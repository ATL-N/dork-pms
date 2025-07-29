import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser(request);

  if (!user || user.userType !== 'ADMIN') {
    await logAction('WARN', 'Forbidden access to all users', { userId: user?.id, ip: request.ip });
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        ownerApprovalStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    await logAction('INFO', 'Fetched all users', { userId: user.id });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    await logAction('ERROR', 'Failed to fetch all users', { userId: user.id, error: error.message });
    console.error("Failed to fetch all users:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
  }
}
