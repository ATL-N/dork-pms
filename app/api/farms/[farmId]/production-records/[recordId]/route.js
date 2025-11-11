
// app/api/farms/[farmId]/production-records/[recordId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

async function checkPermissions(recordId, user, farmId) {
    const record = await prisma.eggProductionRecord.findUnique({
        where: { id: recordId },
        include: { flock: true }
    });

    if (!record) {
        return { authorized: false, reason: 'Record not found' };
    }

    if (record.flock.farmId !== farmId) {
        return { authorized: false, reason: 'Record does not belong to this farm' };
    }

    const farmUser = await prisma.farmUser.findFirst({
        where: { userId: user.id, farmId: farmId }
    });

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    const userRole = farm?.ownerId === user.id ? 'OWNER' : farmUser?.role;

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
            return { authorized: false, reason: 'You can only edit your own records.' };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (recordDate.getTime() < today.getTime()) {
            return { authorized: false, reason: 'You can only edit records on the same day they were created.' };
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
    const { recordId, farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { authorized, reason } = await checkPermissions(recordId, user, farmId);
    if (!authorized) {
        return NextResponse.json({ error: `Forbidden: ${reason}` }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { totalEggs, brokenEggs, notes } = body;

        const updatedRecord = await prisma.eggProductionRecord.update({
            where: { id: recordId },
            data: {
                totalEggs: totalEggs ? parseInt(totalEggs, 10) : undefined,
                brokenEggs: brokenEggs ? parseInt(brokenEggs, 10) : undefined,
                notes: notes,
            },
        });

        await logAction('INFO', `User ${user.id} updated egg production record ${recordId}.`, { userId: user.id, recordId });
        return NextResponse.json(updatedRecord, { status: 200 });

    } catch (error) {
        console.error("Failed to update egg production record:", error);
        await logAction('ERROR', `Failed to update egg production record ${recordId}. Error: ${error.message}`, { userId: user.id, recordId, error: error.stack });
        return NextResponse.json({ error: 'Failed to update egg production record' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { recordId, farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { authorized, reason } = await checkPermissions(recordId, user, farmId);
    if (!authorized) {
        return NextResponse.json({ error: `Forbidden: ${reason}` }, { status: 403 });
    }

    try {
        await prisma.eggProductionRecord.delete({
            where: { id: recordId },
        });

        await logAction('INFO', `User ${user.id} deleted egg production record ${recordId}.`, { userId: user.id, recordId });
        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("Failed to delete egg production record:", error);
        await logAction('ERROR', `Failed to delete egg production record ${recordId}. Error: ${error.message}`, { userId: user.id, recordId, error: error.stack });
        return NextResponse.json({ error: 'Failed to delete egg production record' }, { status: 500 });
    }
}
