// app/api/admin/vets/[vetId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
    const currentUser = await getCurrentUser(req);
    const { vetId } = await params;

    if (!currentUser || currentUser.userType !== 'ADMIN') {
        return new Response('Unauthorized', { status: 401 });
    }

    if (!vetId) {
        return new Response(JSON.stringify({ message: 'Veterinarian ID is required.' }), { status: 400 });
    }

    try {
        await prisma.user.update({
            where: { id: vetId },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ message: 'Veterinarian has been soft-deleted.' });

    } catch (error) {
        console.error('[API/ADMIN/VETS/DELETE]', error);
        // Check for specific Prisma error for record not found
        if (error.code === 'P2025') {
            return new Response(JSON.stringify({ message: 'Veterinarian not found.' }), { status: 404 });
        }
        return new Response('Internal Server Error', { status: 500 });
    }
}
