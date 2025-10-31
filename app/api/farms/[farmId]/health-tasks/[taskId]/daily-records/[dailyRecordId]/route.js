// app/api/farms/[farmId]/health-tasks/[taskId]/daily-records/[dailyRecordId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

import { z } from 'zod';

const prisma = new PrismaClient();

const routeContextSchema = z.object({
  params: z.object({
    farmId: z.string(),
    taskId: z.string(),
    dailyRecordId: z.string(),
  }),
});

export async function PUT(request, { params }) {
    const { farmId, taskId, dailyRecordId } = params;
    try {
        console.log('[DEBUG] PUT handler started');
        console.log('[DEBUG] Params destructured successfully:', { farmId, taskId, dailyRecordId });

        const user = await getCurrentUser(request);
        console.log('[DEBUG] Current user retrieved:', user?.id);

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const farmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have permission to perform this action.' }, { status: 403 });
        }

        const data = await request.json();
        console.log('[DEBUG] Received data:', data);
        const { status, notes, inventoryItemId, quantityUsed } = data;

        if (status !== 'COMPLETED' && status !== 'SKIPPED') {
            return NextResponse.json({ error: 'Invalid status update.' }, { status: 400 });
        }

        console.log('[DEBUG] Starting transaction...');
        const result = await prisma.$transaction(async (tx) => {
            console.log('[DEBUG] Finding daily record:', dailyRecordId);
            const dailyRecord = await tx.dailyTaskRecord.findUnique({
                where: { id: dailyRecordId },
            });

            if (!dailyRecord) {
                throw new Error('Daily task record not found.');
            }
            
            if (dailyRecord.healthTaskId !== taskId) {
                throw new Error('Daily record does not belong to the specified health task.');
            }

            console.log('[DEBUG] Checking inventory...', { inventoryItemId, quantityUsed });
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

                console.log('[DEBUG] Updating inventory item stock...');
                await tx.inventoryItem.update({
                    where: { id: inventoryItemId },
                    data: {
                        currentStock: {
                            decrement: parseFloat(quantityUsed),
                        },
                    },
                });
            }

            console.log('[DEBUG] Updating daily record...');
            const updatedDailyRecord = await tx.dailyTaskRecord.update({
                where: { id: dailyRecordId },
                data: {
                    status,
                    notes,
                    inventoryItemId: inventoryItemId || null,
                    quantityUsed: quantityUsed ? parseFloat(quantityUsed) : null,
                },
            });

            console.log('[DEBUG] Updated daily record:', updatedDailyRecord);

            // Refetch the parent task AFTER updating the daily record to get fresh data
            console.log('[DEBUG] Fetching parent task with updated records...');
            const parentTask = await tx.healthTask.findUnique({
                where: { id: taskId },
                include: { dailyRecords: true },
            });

            console.log('[DEBUG] Parent task:', parentTask);
            console.log('[DEBUG] Daily records statuses:', parentTask?.dailyRecords.map(r => ({ id: r.id, status: r.status })));

            if (parentTask && parentTask.dailyRecords.every(r => r.status === 'COMPLETED' || r.status === 'SKIPPED')) {
                console.log('[DEBUG] All records complete, updating parent task to COMPLETED');
                await tx.healthTask.update({
                    where: { id: taskId },
                    data: { status: 'COMPLETED' },
                });
            } else if (parentTask && parentTask.status !== 'IN_PROGRESS') {
                console.log('[DEBUG] Updating parent task to IN_PROGRESS');
                await tx.healthTask.update({
                    where: { id: taskId },
                    data: { status: 'IN_PROGRESS' },
                });
            }

            return updatedDailyRecord;
        });

        console.log('[DEBUG] Transaction completed successfully');

        await logAction(
            "INFO",
            `User ${user.email} updated daily record for health task ${taskId} on farm ${farmId}.`,
            { farmId, taskId, dailyRecordId: result.id, userId: user.id }
        );

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error('[ERROR] Full error object:', error);
        console.error('[ERROR] Error message:', error.message);
        console.error('[ERROR] Error stack:', error.stack);
        
        await logAction(
            "ERROR",
            `Failed to update daily record for health task ${taskId}. Error: ${error.message}`,
            { farmId, taskId, dailyRecordId, stack: error.stack, userId: user.id }
        );
        return NextResponse.json({ error: error.message || 'Failed to update daily record' }, { status: 500 });
    }
}