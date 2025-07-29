import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function POST(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    await logAction('WARN', 'Unauthorized attempt to accept invitation', { ip: request.ip });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { token } = await request.json();

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== 'PENDING' || new Date(invitation.expiresAt) < new Date()) {
      await logAction('WARN', 'Invalid or expired invitation token', { userId: user.id, token });
      return new Response(JSON.stringify({ error: 'Invalid or expired invitation' }), { status: 400 });
    }

    // Add the user to the farm
    await prisma.farmUser.create({
      data: {
        farmId: invitation.farmId,
        userId: user.id,
        role: invitation.role,
      },
    });

    // Update the invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    await logAction('INFO', `User ${user.id} accepted invitation to farm ${invitation.farmId}` , { userId: user.id, farmId: invitation.farmId });
    return new Response(JSON.stringify({ message: 'Invitation accepted successfully' }), { status: 200 });
  } catch (error) {
    await logAction('ERROR', 'Failed to accept invitation', { userId: user.id, token, error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to accept invitation' }), { status: 500 });
  }
}
