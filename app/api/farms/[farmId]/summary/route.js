// app/api/farms/[farmId]/summary/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findUnique({
            where: { farmId_userId: { farmId, userId: user.id } },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have access to this farm.' }, { status: 403 });
        }

        let farmSummary = await prisma.farmSummary.findUnique({
            where: { farmId },
        });

        if (!farmSummary) {
            // If no summary exists, create one with 0 eggs.
            farmSummary = await prisma.farmSummary.create({
                data: {
                    farmId,
                    totalEggsAvailable: 0,
                }
            })
        }

        return NextResponse.json(farmSummary);
    } catch (error) {
        await logAction(
            "ERROR",
            `Failed to fetch farm summary for farm ${farmId}. Error: ${error.message}`,
            { userId: user.id, farmId, stack: error.stack }
        );
        return NextResponse.json({ error: 'Failed to fetch farm summary' }, { status: 500 });
    }
}
