
// app/api/farms/[farmId]/flocks/[flockId]/mortality-records/[recordId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

async function checkPermissions(recordId, user, farmId, flockId) {
    const record = await prisma.mortalityRecord.findUnique({
        where: { id: recordId },
        include: { flock: true }, // Include the flock relation
    });

    if (!record) {
        return { authorized: false, reason: 'Record not found' };
    }

    // Validate that the record belongs to the correct farm and flock from the URL
    if (record.flock.farmId !== farmId || record.flockId !== flockId) {
        return { authorized: false, reason: 'Record does not belong to this flock/farm' };
    }

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    const isOwner = farm?.ownerId === user.id;

    const farmUser = isOwner ? null : await prisma.farmUser.findFirst({
        where: { userId: user.id, farmId: farmId }
    });

    const userRole = isOwner ? 'OWNER' : farmUser?.role;

    const now = new Date();
    const recordDate = new Date(record.createdAt);

    if (user.userType === 'ADMIN') {
        return { authorized: true, reason: null };
    }

    if (userRole === 'OWNER') {
        const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
        if (recordDate.getTime() < threeDaysAgo.getTime()) {
            return { authorized: false, reason: 'Owner can only edit records within 3 days.' };
        }
    } else if (userRole === 'MANAGER') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (recordDate.getTime() < today.getTime()) {
            return { authorized: false, reason: 'Manager can only edit records on the same day.' };
        }
    } else if (userRole === 'WORKER') {
        if (record.recordedById !== user.id) {
            return { authorized: false, reason: 'Worker can only edit their own records.' };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (recordDate.getTime() < today.getTime()) {
            return { authorized: false, reason: 'Worker can only edit records on the same day.' };
        }
        if (now.getHours() >= 19) {
            return { authorized: false, reason: 'Editing is not allowed after 7 PM.' };
        }
    } else {
        return { authorized: false, reason: 'You do not have a role on this farm.' };
    }

    return { authorized: true, reason: null };
}

export async function PUT(request, { params }) {
    const { recordId, farmId, flockId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { authorized, reason } = await checkPermissions(recordId, user, farmId, flockId);
    if (!authorized) {
        return NextResponse.json({ error: `Forbidden: ${reason}` }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { quantity, cause } = body;

        const updatedRecord = await prisma.mortalityRecord.update({
            where: { id: recordId },
            data: {
                quantity: quantity ? parseInt(quantity, 10) : undefined,
                cause: cause,
            },
        });

        await logAction('INFO', `User ${user.id} updated mortality record ${recordId}.`, { userId: user.id, recordId });
        return NextResponse.json(updatedRecord, { status: 200 });

    } catch (error) {
        console.error("Failed to update mortality record:", error);
        await logAction('ERROR', `Failed to update mortality record ${recordId}. Error: ${error.message}`, { userId: user.id, recordId, error: error.stack });
        return NextResponse.json({ error: 'Failed to update mortality record' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { recordId, farmId, flockId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { authorized, reason } = await checkPermissions(recordId, user, farmId, flockId);
    if (!authorized) {
        return NextResponse.json({ error: `Forbidden: ${reason}` }, { status: 403 });
    }

    try {
        await prisma.mortalityRecord.delete({
            where: { id: recordId },
        });

        await logAction('INFO', `User ${user.id} deleted mortality record ${recordId}.`, { userId: user.id, recordId });
        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("Failed to delete mortality record:", error);
        await logAction('ERROR', `Failed to delete mortality record ${recordId}. Error: ${error.message}`, { userId: user.id, recordId, error: error.stack });
        return NextResponse.json({ error: 'Failed to delete mortality record' }, { status: 500 });
    }
}
