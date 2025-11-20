// app/api/farms/[farmId]/health-tasks/[taskId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
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
        const { status, inventoryLotId, quantityUsed, notes } = data;

        if (status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Invalid status for this operation.' }, { status: 400 });
        }

        const updatedTask = await prisma.$transaction(async (tx) => {
            const task = await tx.healthTask.findUnique({ where: { id: taskId } });
            if (!task) {
                throw new Error('Health task not found.');
            }

            // 1. Handle inventory update if applicable
            if (inventoryLotId && quantityUsed != null && parseFloat(quantityUsed) > 0) {
                const lot = await tx.inventoryLot.findUnique({ where: { id: inventoryLotId } });
                if (!lot) {
                    throw new Error('Inventory lot not found.');
                }
                if (lot.remainingQuantity < parseFloat(quantityUsed)) {
                    throw new Error(`Not enough stock in lot. Available: ${lot.remainingQuantity}`);
                }
                await tx.inventoryLot.update({
                    where: { id: inventoryLotId },
                    data: { remainingQuantity: { decrement: parseFloat(quantityUsed) } },
                });
            }

            // 2. Create or update the DailyTaskRecord for a single-day task
            // For multi-day tasks, the client should use the specific daily-record endpoint
            if (task.durationInDays <= 1) {
                const today = new Date();
                // Use upsert to create a daily record if it doesn't exist, or update if it does.
                await tx.dailyTaskRecord.upsert({
                    where: {
                        healthTaskId_date: {
                            healthTaskId: taskId,
                            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                        }
                    },
                    update: {
                        status: 'COMPLETED',
                        notes,
                        inventoryLotId,
                        quantityUsed: quantityUsed ? parseFloat(quantityUsed) : null,
                    },
                    create: {
                        healthTaskId: taskId,
                        date: new Date(),
                        status: 'COMPLETED',
                        notes,
                        inventoryLotId,
                        quantityUsed: quantityUsed ? parseFloat(quantityUsed) : null,
                    }
                });
            }

            // 3. Update the parent health task
            const parentTask = await tx.healthTask.update({
                where: { id: taskId },
                data: {
                    status: 'COMPLETED',
                    completedDate: new Date(),
                    notes: notes, // Also update notes on the parent task
                },
            });

            return parentTask;
        });


        await logAction(
            "INFO",
            `User ${user.email} completed health task '${updatedTask.taskName}' for farm ${farmId}.`,
            { farmId, taskId: updatedTask.id, userId: user.id }
        );

        return NextResponse.json(updatedTask, { status: 200 });

    } catch (error) {
        console.error(`Failed to update health task ${taskId}:`, error);
        await logAction(
            "ERROR",
            `Failed to update health task ${taskId} for farm ${farmId}. Error: ${error.message}`,
            { farmId, taskId, stack: error.stack, userId: user.id }
        );
        return NextResponse.json({ error: error.message || 'Failed to update health task' }, { status: 500 });
    }
}
