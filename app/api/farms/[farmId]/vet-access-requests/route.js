// app/api/farms/[farmId]/vet-access-requests/route.js
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

// GET pending vet access requests
export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = await params;
  const farmUser = await getUserFarmRole(user.id, farmId);

  if (!farmUser || !['OWNER', 'MANAGER'].includes(farmUser.role)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const requests = await prisma.vetAccessRequest.findMany({
      where: {
        farmId: farmId,
        status: 'PENDING',
      },
      include: {
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    await logAction('INFO', `User ${user.id} fetched vet access requests for farm ${farmId}`);
    return new Response(JSON.stringify(requests), { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch vet access requests for farm ${farmId}:`, error);
    await logAction('ERROR', `Failed to fetch vet access requests for farm ${farmId}`, { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to fetch requests' }), { status: 500 });
  }
}

// PUT to approve or reject a request
export async function PUT(request, { params }) {
    const user = await getCurrentUser(request);
    if (!user?.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { farmId } = await params;
    const farmUser = await getUserFarmRole(user.id, farmId);

    if (!farmUser || !['OWNER', 'MANAGER'].includes(farmUser.role)) {
        return new Response(JSON.stringify({ error: 'Forbidden: Only owners or managers can manage requests.' }), { status: 403 });
    }

    try {
        const { requestId, action } = await request.json(); // action: 'approve' or 'reject'

        if (!requestId || !['approve', 'reject'].includes(action)) {
            return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
        }

        const requestToUpdate = await prisma.vetAccessRequest.findUnique({
            where: { id: requestId },
        });

        if (!requestToUpdate || requestToUpdate.farmId !== farmId || requestToUpdate.status !== 'PENDING') {
            return new Response(JSON.stringify({ error: 'Request not found or already handled' }), { status: 404 });
        }

        if (action === 'approve') {
            await prisma.$transaction(async (tx) => {
                // Update the request status
                await tx.vetAccessRequest.update({
                    where: { id: requestId },
                    data: { status: 'APPROVED' },
                });

                // Grant access
                await tx.vetAccess.create({
                    data: {
                        farmId: farmId,
                        userId: requestToUpdate.veterinarianId,
                    },
                });
            });
            await logAction('UPDATE', `User ${user.id} approved vet access request ${requestId} for farm ${farmId}`);
        } else { // action === 'reject'
            await prisma.vetAccessRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' },
            });
            await logAction('UPDATE', `User ${user.id} rejected vet access request ${requestId} for farm ${farmId}`);
        }

        return new Response(JSON.stringify({ message: `Request ${action}d successfully` }), { status: 200 });

    } catch (error) {
        console.error(`Failed to handle vet access request for farm ${farmId}:`, error);
        await logAction('ERROR', `Failed to handle vet access request for farm ${farmId}`, { error: error.message });
        return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
    }
}
