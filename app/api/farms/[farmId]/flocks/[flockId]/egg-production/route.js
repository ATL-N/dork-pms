// app/api/farms/[farmId]/flocks/[flockId]/egg-production/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { farmId, flockId } = params;
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

        const records = await prisma.eggProductionRecord.findMany({
            where: {
                flockId: flockId,
            },
            orderBy: {
                date: 'asc',
            },
        });

        return NextResponse.json(records, { status: 200 });

    } catch (error) {
        await logAction(
            "ERROR",
            `Failed to fetch egg production records for flock ${flockId}. Error: ${error.message}`,
            { farmId, flockId, stack: error.stack, userId: user.id }
        );
        return NextResponse.json({ error: 'Failed to fetch egg production records' }, { status: 500 });
    }
}
