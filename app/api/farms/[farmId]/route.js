// app/api/farms/[farmId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
    const { farmId } = params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farm = await prisma.farm.findUnique({
            where: { id: farmId },
            include: {
                users: true,
            },
        });

        if (!farm) {
            return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
        }

        // Check if the user is the owner of the farm
        if (farm.ownerId !== user.id) {
            return NextResponse.json({ error: 'You are not authorized to delete this farm.' }, { status: 403 });
        }

        // Check if there are any flocks associated with the farm
        const flockCount = await prisma.flock.count({
            where: { farmId: farmId },
        });

        if (flockCount > 0) {
            return NextResponse.json({ error: `Cannot delete farm because it has ${flockCount} flock(s) associated with it.` }, { status: 409 });
        }

        // Proceed with deletion
        await prisma.farm.delete({
            where: { id: farmId },
        });

        await logAction('INFO', `User ${user.id} deleted farm ${farmId}.`, { userId: user.id, farmId });

        return new Response(null, { status: 204 }); // No Content

    } catch (error) {
        await logAction('ERROR', `Failed to delete farm ${farmId}. Error: ${error.message}`, { userId: user.id, farmId, error: error.stack });
        return NextResponse.json({ error: 'Failed to delete farm' }, { status: 500 });
    }
}