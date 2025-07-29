// app/api/farms/[farmId]/growth-records/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId } = params;
    const user = await getCurrentUser();

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

        const growthRecords = await prisma.growthRecord.findMany({
            where: { flock: { farmId: farmId } },
            include: { flock: { select: { name: true, farmId: true } } },
            orderBy: { date: 'desc' },
        });

        return NextResponse.json(growthRecords);
    } catch (error) {
        await logAction(
            "ERROR",
            `Failed to fetch growth records for farm ${farmId}. Error: ${error.message}`,
            { userId: user.id, farmId, stack: error.stack }
        );
        return NextResponse.json({ error: 'Failed to fetch growth records' }, { status: 500 });
    }
}
