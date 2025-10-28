// app/api/farms/[farmId]/vet-access-requests/[requestId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { z } from 'zod';

const prisma = new PrismaClient();

const routeContextSchema = z.object({
  params: z.object({
    farmId: z.string(),
    requestId: z.string(),
  }),
});

const patchBodySchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
});

export async function PATCH(req, context) {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { params } = await routeContextSchema.parse(await context);
        const { farmId, requestId } = params;
        const body = await req.json();
        const { status } = patchBodySchema.parse(body);

        const farm = await prisma.farm.findUnique({ where: { id: farmId } });
        const farmUser = await prisma.farmUser.findFirst({ where: { farmId, userId: currentUser.id, role: { in: ['OWNER', 'MANAGER'] } } });

        if (!farm || (farm.ownerId !== currentUser.id && !farmUser && currentUser.userType !== 'ADMIN')) {
            await logAction('WARN', `User ${currentUser.id} unauthorized to update vet access request ${requestId}.`);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const request = await prisma.vetAccessRequest.findUnique({ where: { id: requestId } });
        if (!request || request.farmId !== farmId) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const updatedRequest = await prisma.vetAccessRequest.update({
            where: { id: requestId },
            data: { status },
        });

        if (status === 'APPROVED') {
            // Add vet to VetFarmAccess table
            await prisma.vetFarmAccess.create({
                data: {
                    farmId,
                    veterinarianId: request.veterinarianId,
                    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year access
                }
            });
            await logAction('INFO', `User ${currentUser.id} approved vet access request ${requestId}.`, { userId: currentUser.id, farmId });
        } else {
            await logAction('INFO', `User ${currentUser.id} rejected vet access request ${requestId}.`, { userId: currentUser.id, farmId });
        }

        return NextResponse.json(updatedRequest);

    } catch (error) {
        console.error('Error updating vet access request:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}