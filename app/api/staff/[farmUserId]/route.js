// app/api/staff/[farmUserId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from "@/app/lib/logging";

const prisma = new PrismaClient();

// Update user role
export async function PUT(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { farmUserId } = params;
    const { farmId, role } = await request.json();

    if (!farmId || !role) {
        return NextResponse.json({ error: 'farmId and role are required' }, { status: 400 });
    }

    try {
        const currentUserAccess = await prisma.farmUser.findFirst({
            where: { userId: user.id, farmId },
        });

        if (!currentUserAccess || !['OWNER', 'MANAGER'].includes(currentUserAccess.role)) {
            return NextResponse.json({ error: 'Permission denied to change roles.' }, { status: 403 });
        }

        const updatedFarmUser = await prisma.farmUser.update({
            where: {
                farmId_userId: {
                    farmId,
                    userId: farmUserId,
                },
            },
            data: { role },
        });
        
        await log({
            userId: user.id,
            farmId,
            action: 'update_role',
            details: `User ${user.name} updated role for user ${farmUserId} to ${role}`
        });

        return NextResponse.json(updatedFarmUser);
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
}

// Remove user from farm
export async function DELETE(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { farmUserId } = params;
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    if (!farmId) {
        return NextResponse.json({ error: 'farmId is required' }, { status: 400 });
    }

    try {
        const currentUserAccess = await prisma.farmUser.findFirst({
            where: { userId: user.id, farmId },
        });

        if (!currentUserAccess || !['OWNER', 'MANAGER'].includes(currentUserAccess.role)) {
            return NextResponse.json({ error: 'Permission denied to remove users.' }, { status: 403 });
        }
        
        // Prevent owner from being removed
        const targetUser = await prisma.farmUser.findFirst({ where: { userId: farmUserId, farmId } });
        if (targetUser.role === 'OWNER') {
            return NextResponse.json({ error: 'Cannot remove the owner of the farm.' }, { status: 400 });
        }

        await prisma.farmUser.delete({
            where: {
                farmId_userId: {
                    farmId,
                    userId: farmUserId,
                },
            },
        });
        
        await log({
            userId: user.id,
            farmId,
            action: 'remove_user',
            details: `User ${user.name} removed user ${farmUserId} from farm`
        });

        return NextResponse.json({ message: 'User removed successfully' });
    } catch (error) {
        console.error('Error removing user:', error);
        return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
    }
}