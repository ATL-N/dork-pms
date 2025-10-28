// app/api/farms/[farmId]/health-tasks/[taskId]/daily-records/[dailyRecordId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    const { farmId, taskId, dailyRecordId } = await params;
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
        const { status, notes, inventoryItemId, quantityUsed } = data;

        if (status !== 'COMPLETED' && status !== 'SKIPPED') {
            return NextResponse.json({ error: 'Invalid status update.' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const dailyRecord = await tx.dailyTaskRecord.findUnique({
                where: { id: dailyRecordId },
            });

            if (!dailyRecord) {
                throw new Error('Daily task record not found.');
            }
            
            if (dailyRecord.healthTaskId !== taskId) {
                throw new Error('Daily record does not belong to the specified health task.');
            }

            if (inventoryItemId && quantityUsed > 0) {
                const inventoryItem = await tx.inventoryItem.findUnique({
                    where: { id: inventoryItemId },
                });

                if (!inventoryItem) {
                    throw new Error('Inventory item not found.');
                }
                if (inventoryItem.currentStock < quantityUsed) {
                    throw new Error(`Not enough stock for ${inventoryItem.name}.`);
                }

                await tx.inventoryItem.update({
                    where: { id: inventoryItemId },
                    data: {
                        currentStock: {
                            decrement: parseFloat(quantityUsed),
                        },
                    },
                });
            }

            const updatedDailyRecord = await tx.dailyTaskRecord.update({
                where: { id: dailyRecordId },
                data: {
                    status,
                    notes,
                    inventoryItemId,
                    quantityUsed: quantityUsed ? parseFloat(quantityUsed) : null,
                },
            });

            // After updating the daily record, check if the parent task should be updated
            const parentTask = await tx.healthTask.findUnique({
                where: { id: taskId },
                include: { dailyRecords: true },
            });

            if (parentTask && parentTask.dailyRecords.every(r => r.status === 'COMPLETED' || r.status === 'SKIPPED')) {
                await tx.healthTask.update({
                    where: { id: taskId },
                    data: { status: 'COMPLETED' },
                });
            } else if (parentTask && parentTask.status !== 'IN_PROGRESS') {
                await tx.healthTask.update({
                    where: { id: taskId },
                    data: { status: 'IN_PROGRESS' },
                });
            }

            return updatedDailyRecord;
        });

        await logAction({
            level: "INFO",
            message: `User ${user.email} updated daily record for health task ${taskId} on farm ${farmId}.`,
            userId: user.id,
            meta: { farmId, taskId, dailyRecordId: result.id },
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        await logAction({
            level: "ERROR",
            message: `Failed to update daily record for health task ${taskId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, taskId, stack: error.stack },
        });
        return NextResponse.json({ error: error.message || 'Failed to update daily record' }, { status: 500 });
    }
}
