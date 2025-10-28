
// app/api/farms/[farmId]/flocks/[flockId]/growth-records/[recordId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

async function checkPermissions(recordId, user) {
    const record = await prisma.growthRecord.findUnique({
        where: { id: recordId },
        include: { flock: true },
    });

    if (!record) {
        return { authorized: false, reason: 'Record not found' };
    }

    const farmUser = await prisma.farmUser.findFirst({
        where: { farmId: record.flock.farmId, userId: user.id },
    });

    const now = new Date();
    const recordDate = new Date(record.createdAt);

    if (user.userType === 'ADMIN') {
        return { authorized: true, reason: null };
    }

    if (farmUser?.role === 'OWNER') {
        const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
        if (recordDate < threeDaysAgo) {
            return { authorized: false, reason: 'Owner can only edit records within 3 days.' };
        }
    } else if (farmUser?.role === 'MANAGER') {
        if (!DateUtils.isSameDay(recordDate, now)) {
            return { authorized: false, reason: 'Manager can only edit records on the same day.' };
        }
    } else if (farmUser?.role === 'WORKER') {
        if (record.recordedById !== user.id) {
            return { authorized: false, reason: 'Worker can only edit their own records.' };
        }
        if (!DateUtils.isSameDay(recordDate, now)) {
            return { authorized: false, reason: 'Worker can only edit records on the same day.' };
        }
        if (now.getHours() >= 19) {
            return { authorized: false, reason: 'Editing is not allowed after 7 PM.' };
        }
    } else {
        return { authorized: false, reason: 'You do not have permission to edit this record.' };
    }

    return { authorized: true, reason: null };
}

export async function PUT(request, { params }) {
    const { recordId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { authorized, reason } = await checkPermissions(recordId, user);
    if (!authorized) {
        return NextResponse.json({ error: `Forbidden: ${reason}` }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { weight } = body;

        const updatedRecord = await prisma.growthRecord.update({
            where: { id: recordId },
            data: {
                weight: weight ? parseFloat(weight) : undefined,
            },
        });

        await logAction('INFO', `User ${user.id} updated growth record ${recordId}.`, { userId: user.id, recordId });
        return NextResponse.json(updatedRecord, { status: 200 });

    } catch (error) {
        console.error("Failed to update growth record:", error);
        await logAction('ERROR', `Failed to update growth record ${recordId}. Error: ${error.message}`, { userId: user.id, recordId, error: error.stack });
        return NextResponse.json({ error: 'Failed to update growth record' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { recordId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { authorized, reason } = await checkPermissions(recordId, user);
    if (!authorized) {
        return NextResponse.json({ error: `Forbidden: ${reason}` }, { status: 403 });
    }

    try {
        await prisma.growthRecord.delete({
            where: { id: recordId },
        });

        await logAction('INFO', `User ${user.id} deleted growth record ${recordId}.`, { userId: user.id, recordId });
        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("Failed to delete growth record:", error);
        await logAction('ERROR', `Failed to delete growth record ${recordId}. Error: ${error.message}`, { userId: user.id, recordId, error: error.stack });
        return NextResponse.json({ error: 'Failed to delete growth record' }, { status: 500 });
    }
}
