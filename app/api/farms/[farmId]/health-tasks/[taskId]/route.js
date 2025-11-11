// app/api/farms/[farmId]/health-tasks/[taskId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    const { farmId, taskId } =await  params;
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
        const { status, inventoryItemId, quantityUsed, notes } = data;

        if (status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Invalid status update.' }, { status: 400 });
        }

        // 1. Handle inventory update if applicable
        if (inventoryItemId && quantityUsed != null && parseFloat(quantityUsed) > 0) {
            await prisma.$transaction(async (tx) => {
                const inventoryItem = await tx.inventoryItem.findUnique({
                    where: { id: inventoryItemId },
                });

                if (!inventoryItem) {
                    throw new Error('Inventory item not found.');
                }
                if (inventoryItem.currentStock < parseFloat(quantityUsed)) {
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
            });
        }

        // 2. Update the health task
        const updatedTask = await prisma.healthTask.update({
            where: { id: taskId },
            data: {
                status: 'COMPLETED',
                completedDate: new Date(),
                inventoryItemId: inventoryItemId,
                quantityUsed: quantityUsed ? parseFloat(quantityUsed) : null,
                notes: notes,
            },
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
