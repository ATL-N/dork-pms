// app/api/farms/[farmId]/invitations/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const postBodySchema = z.object({
    email: z.string().email("Invalid email address."),
    role: z.enum(['MANAGER', 'WORKER']),
});

export async function POST(req, { params }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { farmId } = params;
        const body = await req.json();
        const { email, role } = postBodySchema.parse(body);

        const farm = await prisma.farm.findUnique({ where: { id: farmId } });
        const farmUser = await prisma.farmUser.findFirst({ where: { farmId, userId: currentUser.id, role: { in: ['OWNER', 'MANAGER'] } } });

        if (!farm || (farm.ownerId !== currentUser.id && !farmUser && currentUser.userType !== 'ADMIN')) {
            await logAction('WARN', `User ${currentUser.id} unauthorized to send invitation for farm ${farmId}.`);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours

        const newInvitation = await prisma.invitation.create({
            data: {
                email,
                role,
                farmId,
                token,
                expiresAt,
            },
        });

        // In a real application, you would send an email with the invitation link here.
        // For now, we'll just log it.
        const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${token}`;
        await logAction('INFO', `User ${currentUser.id} invited ${email} to farm ${farmId}. Link: ${invitationLink}`, { userId: currentUser.id, farmId });

        return NextResponse.json(newInvitation, { status: 201 });

    } catch (error) {
        console.error('Error sending invitation:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}