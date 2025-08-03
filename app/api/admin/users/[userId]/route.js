// app/api/admin/users/[userId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
    const currentUser = await getCurrentUser();
    const { userId } = params;

    if (!currentUser || currentUser.userType !== 'ADMIN') {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { userType } = await req.json();

        if (!userType || !['ADMIN', 'VET', 'FARMER'].includes(userType)) {
            return new Response(JSON.stringify({ message: 'Invalid user type specified.' }), { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { userType },
        });

        const { passwordHash: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error('[API/ADMIN/USERS/UPDATE]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const currentUser = await getCurrentUser();
    const { userId } = params;

    if (!currentUser || currentUser.userType !== 'ADMIN') {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: 'User has been soft-deleted.' });

    } catch (error) {
        console.error('[API/ADMIN/USERS/DELETE]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
