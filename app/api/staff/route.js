// app/api/staff/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';


const prisma = new PrismaClient();

export async function GET(request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    if (!farmId) {
        return NextResponse.json({ error: 'farmId is required' }, { status: 400 });
    }

    try {
        const farmAccess = await prisma.farmUser.findFirst({
            where: {
                userId: user.id,
                farmId: farmId,
            },
        });

        if (!farmAccess && user.userType !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const staff = await prisma.farmUser.findMany({
            where: { farmId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                assignedAt: 'desc',
            },
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
}