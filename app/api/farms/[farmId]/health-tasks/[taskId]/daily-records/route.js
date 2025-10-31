// app/api/farms/[farmId]/health-tasks/[taskId]/daily-records/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId, taskId } = params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have permission to view these records.' }, { status: 403 });
        }

        const dailyRecords = await prisma.dailyTaskRecord.findMany({
            where: {
                healthTaskId: taskId,
            },
            orderBy: {
                date: 'asc',
            },
        });

        return NextResponse.json(dailyRecords, { status: 200 });

    } catch (error) {
        await logAction(
            "ERROR",
            `Failed to fetch daily records for health task ${taskId}. Error: ${error.message}`,
            { farmId, taskId, stack: error.stack, userId: user.id }
        );
        return NextResponse.json({ error: 'Failed to fetch daily records' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    const { farmId, taskId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have permission to perform this action.' }, { status: 403 });
        }

        const data = await request.json();
        const { id, date, status } = data;

        const newRecord = await prisma.dailyTaskRecord.create({
            data: {
                id, // Use client-generated ID
                healthTaskId: taskId,
                date: new Date(date),
                status,
            },
        });

        await logAction(
            "INFO",
            `User ${user.email} created daily record for health task ${taskId}.`,
            { farmId, taskId, dailyRecordId: newRecord.id, userId: user.id }
        );

        return NextResponse.json(newRecord, { status: 201 });

    } catch (error) {
        await logAction(
            "ERROR",
            `Failed to create daily record for health task ${taskId}. Error: ${error.message}`,
            { farmId, taskId, stack: error.stack, userId: user.id }
        );
        return NextResponse.json({ error: 'Failed to create daily record' }, { status: 500 });
    }
}