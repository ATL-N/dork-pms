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

export async function PUT(request, {params}) {

    const { farmId, taskId, dailyRecordId } = await params;

    let user; // Declare user in a higher scope



    try {

        user = await getCurrentUser(request);

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

        const { status, notes, inventoryLotId, quantityUsed } = data;



        if (status !== 'COMPLETED' && status !== 'SKIPPED') {

            return NextResponse.json({ error: 'Invalid status update.' }, { status: 400 });

        }



        const result = await prisma.$transaction(async (tx) => {

            // 1. Handle inventory update if applicable

            if (inventoryLotId && quantityUsed > 0 && status === 'COMPLETED') {

                const lot = await tx.inventoryLot.findUnique({ where: { id: inventoryLotId } });

                if (!lot) {

                    throw new Error('Inventory lot not found.');

                }

                if (lot.remainingQuantity < quantityUsed) {

                    throw new Error(`Not enough stock in lot. Available: ${lot.remainingQuantity}`);

                }

                await tx.inventoryLot.update({

                    where: { id: inventoryLotId },

                    data: { remainingQuantity: { decrement: parseFloat(quantityUsed) } },

                });

            }



            // 2. Use upsert to create or update the daily record

            const updatedDailyRecord = await tx.dailyTaskRecord.upsert({

                where: { id: dailyRecordId },

                update: {

                    status,

                    notes,

                    inventoryLotId: inventoryLotId || null,

                    quantityUsed: quantityUsed ? parseFloat(quantityUsed) : null,

                },

                create: {

                    id: dailyRecordId,

                    healthTaskId: taskId,

                    date: new Date(), // The date of completion

                    status,

                    notes,

                    inventoryLotId: inventoryLotId || null,

                    quantityUsed: quantityUsed ? parseFloat(quantityUsed) : null,

                }

            });



            // 3. Check and update the parent task's status

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



        await logAction(

            "INFO",

            `User ${user.email} updated daily record for health task ${taskId} on farm ${farmId}.`,

            { farmId, taskId, dailyRecordId: result.id, userId: user.id }

        );



        return NextResponse.json(result, { status: 200 });



    } catch (error) {

        const userId = user ? user.id : 'unknown';

        await logAction(

            "ERROR",

            `Failed to update daily record for health task ${taskId}. Error: ${error.message}`,

            { farmId, taskId, dailyRecordId, stack: error.stack, userId }

        );

        return NextResponse.json({ error: error.message || 'Failed to update daily record' }, { status: 500 });

    }

}
