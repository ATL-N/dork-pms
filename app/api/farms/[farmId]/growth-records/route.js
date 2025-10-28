// app/api/farms/[farmId]/growth-records/route.js
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'date';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const growthRecords = await prisma.growthRecord.findMany({
            where: {
                flock: {
                    farmId: farmId,
                },
                date: {
                    gte: thirtyDaysAgo,
                },
            },
            include: { flock: true, recordedBy: true },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip: page * limit,
            take: limit,
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
