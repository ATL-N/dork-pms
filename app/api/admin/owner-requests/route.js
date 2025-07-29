
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

// This function is not used in the new implementation but kept for potential future use.
export async function GET(request) {
  // ... (existing GET implementation)
}

// UPDATE an owner application status
export async function PUT(request) {
  const adminUser = await getCurrentUser(request);

  if (!adminUser || adminUser.userType !== 'ADMIN' || adminUser.deletedAt) {
    await logAction('WARN', 'Forbidden attempt to update owner status', { userId: adminUser?.id, ip: request.ip });
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const { userId, status } = await request.json();

    if (!userId || !status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      await logAction('WARN', 'Invalid owner status update request', { 
        adminId: adminUser.id, 
        request: { userId, status } 
      });
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { ownerApprovalStatus: status },
    });

    await logAction('INFO', `Admin updated owner status to ${status} for user ${userId}`, { 
      adminId: adminUser.id, 
      targetUserId: userId, 
      previousStatus: targetUser.ownerApprovalStatus, 
      newStatus: status 
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    await logAction('ERROR', 'Failed to update owner status', { 
      adminId: adminUser.id, 
      error: error.message 
    });
    console.error("Failed to update owner status:", error);
    return new Response(JSON.stringify({ error: 'Failed to update owner status' }), { status: 500 });
  }
}
