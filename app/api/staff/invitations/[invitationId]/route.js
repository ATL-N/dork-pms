// app/api/staff/invitations/[invitationId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Cancel an invitation
export async function DELETE(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { invitationId } = params;

    try {
        const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
        if (!invitation) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        const currentUserAccess = await prisma.farmUser.findFirst({
            where: { userId: user.id, farmId: invitation.farmId },
        });

        if (!currentUserAccess || !['OWNER', 'MANAGER'].includes(currentUserAccess.role)) {
            return NextResponse.json({ error: 'Permission denied to cancel invitations.' }, { status: 403 });
        }

        await prisma.invitation.delete({ where: { id: invitationId } });
        
        await log('INFO', `cancel_invitation: User ${user.name} cancelled invitation for ${invitation.email}`, { userId: user.id, farmId: invitation.farmId });

        return NextResponse.json({ message: 'Invitation cancelled' });
    } catch (error) {
        console.error('Error cancelling invitation:', error);
        return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 });
    }
}