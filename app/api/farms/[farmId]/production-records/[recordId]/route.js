
// app/api/farms/[farmId]/production-records/[recordId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

async function checkPermissions(recordId, user) {
    const record = await prisma.eggProductionRecord.findUnique({
        where: { id: recordId },
    });

    if (!record) {
        return { authorized: false, reason: 'Record not found' };
    }

    const now = new Date();
    const recordDate = new Date(record.createdAt);

    if (user.userType === 'ADMIN') {
        const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
        if (recordDate < threeDaysAgo) {
            return { authorized: false, reason: 'Admin can only edit records within 3 days.' };
        }
    } else { // For FARMER
        if (record.recordedById !== user.id) {
            return { authorized: false, reason: 'You can only edit your own records.' };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (recordDate < today) {
            return { authorized: false, reason: 'You can only edit records on the same day they were created.' };
        }
        if (now.getHours() >= 19) {
            return { authorized: false, reason: 'Editing is not allowed after 7 PM.' };
        }
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
