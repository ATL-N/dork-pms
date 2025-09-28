// app/api/farms/[farmId]/health-tasks/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

// GET all health tasks for a specific farm
export async function GET(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findUnique({
            where: {
                farmId_userId: { farmId, userId: user.id },
            },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const since = searchParams.get('since');

        const whereClause = {
            flock: {
                farmId: farmId,
                status: 'active'
            },
        };

        if (since) {
            whereClause.updatedAt = {
                gt: new Date(since),
            };
        }

        const healthTasks = await prisma.healthTask.findMany({
            where: whereClause,
            include: {
                flock: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                scheduledDate: 'asc',
            },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasksWithStatus = healthTasks.map(task => {
            const scheduledDate = new Date(task.scheduledDate);
            scheduledDate.setHours(0, 0, 0, 0);

            let status = task.status;
            if (status !== 'COMPLETED') {
                if (scheduledDate < today) {
                    status = 'MISSED';
                } else {
                    status = 'PENDING';
                }
            }
            return { ...task, status };
        });

        return NextResponse.json(tasksWithStatus);

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to fetch health tasks for farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });
        return NextResponse.json({ error: 'Failed to fetch health tasks' }, { status: 500 });
    }
}

// POST a new ad-hoc health task
export async function POST(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have permission to perform this action.' }, { status: 403 });
        }

        const data = await request.json();
        const { flockId, taskType, taskName, method, notes, inventoryItemId, quantityUsed, status, completedDate } = data;

        if (!flockId || !taskType || !taskName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const taskData = {
            flockId,
            taskType,
            taskName,
            method,
            notes,
            status,
            completedDate: completedDate ? new Date(completedDate) : null,
            scheduledDate: new Date(), // For ad-hoc tasks, scheduled is now
        };

        const result = await prisma.$transaction(async (tx) => {
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
                taskData.inventoryItemId = inventoryItemId;
                taskData.quantityUsed = parseFloat(quantityUsed);
            }

            return await tx.healthTask.create({ data: taskData });
        });

        await log({
            level: "INFO",
            message: `User ${user.email} recorded new health event '${taskName}' for flock ${flockId}.`,
            userId: user.id,
            meta: { farmId, flockId, healthTaskId: result.id },
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to record health event for farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });
        return NextResponse.json({ error: error.message || 'Failed to record health event' }, { status: 500 });
    }
}