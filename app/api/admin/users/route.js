// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET() {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.userType !== 'ADMIN') {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null, // Only fetch users that have not been soft-deleted
            },
            select: {
                id: true,
                name: true,
                email: true,
                userType: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('[API/ADMIN/USERS/GET]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}