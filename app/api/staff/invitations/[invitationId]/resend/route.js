// app/api/staff/invitations/[invitationId]/resend/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Resend an invitation
export async function POST(request, { params }) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { invitationId } = awaitparams;

    try {
        const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
        if (!invitation) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        const currentUserAccess = await prisma.farmUser.findFirst({
            where: { userId: user.id, farmId: invitation.farmId },
        });

        if (!currentUserAccess || !['OWNER', 'MANAGER'].includes(currentUserAccess.role)) {
            return NextResponse.json({ error: 'Permission denied to resend invitations.' }, { status: 403 });
        }

        const newToken = crypto.randomBytes(32).toString('hex');
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const updatedInvitation = await prisma.invitation.update({
            where: { id: invitationId },
            data: {
                token: newToken,
                expiresAt: newExpiresAt,
                status: 'PENDING',
            },
        });
        
        // Here you would typically resend the email
        // e.g., sendInvitationEmail(invitation.email, newToken);

        await log('INFO', `resend_invitation: User ${user.name} resent invitation for ${invitation.email}`, { userId: user.id, farmId: invitation.farmId });

        return NextResponse.json(updatedInvitation);
    } catch (error) {
        console.error('Error resending invitation:', error);
        return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
    }
}
