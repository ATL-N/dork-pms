// app/api/farms/[farmId]/health-tasks/[taskId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    const { farmId, taskId } = params;
    const user = await getCurrentUser();

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
        const { status, inventoryItemId, quantityUsed, notes } = data;

        if (status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Invalid status update.' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const taskToUpdate = await tx.healthTask.findUnique({
                where: { id: taskId },
            });

            if (!taskToUpdate) {
                throw new Error('Health task not found.');
            }
            
            if (taskToUpdate.status === 'COMPLETED') {
                throw new Error('Task is already completed.');
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

            const updatedTask = await tx.healthTask.update({
                where: { id: taskId },
                data: {
                    status: 'COMPLETED',
                    completedDate: new Date(),
                    inventoryItemId,
                    quantityUsed: parseFloat(quantityUsed),
                    notes,
                },
            });

            return updatedTask;
        });

        await logAction({
            level: "INFO",
            message: `User ${user.email} completed health task '${result.taskName}' for farm ${farmId}.`,
            userId: user.id,
            meta: { farmId, taskId: result.id },
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        await logAction({
            level: "ERROR",
            message: `Failed to update health task ${taskId} for farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, taskId, stack: error.stack },
        });
        return NextResponse.json({ error: error.message || 'Failed to update health task' }, { status: 500 });
    }
}
