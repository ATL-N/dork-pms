// app/api/staff/invitations/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from "@/app/lib/logging";
import crypto from 'crypto';

const prisma = new PrismaClient();

// Get all pending invitations for a farm
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
            where: { userId: user.id, farmId },
        });

        if (!farmAccess && user.userType !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const invitations = await prisma.invitation.findMany({
            where: { farmId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(invitations);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
    }
}

// Invite a new user
export async function POST(request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { farmId, email, role } = await request.json();

    if (!farmId || !email || !role) {
        return NextResponse.json({ error: 'farmId, email, and role are required' }, { status: 400 });
    }

    try {
        const currentUserAccess = await prisma.farmUser.findFirst({
            where: { userId: user.id, farmId },
        });

        if (!currentUserAccess || !['OWNER', 'MANAGER'].includes(currentUserAccess.role)) {
            return NextResponse.json({ error: 'Permission denied to invite users.' }, { status: 403 });
        }

        // Check if user is already on the farm
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            const isOnFarm = await prisma.farmUser.findFirst({ where: { farmId, userId: existingUser.id } });
            if (isOnFarm) {
                return NextResponse.json({ error: 'User is already a member of this farm.' }, { status: 400 });
            }
        }
        
        // Check for existing pending invitation
        const existingInvitation = await prisma.invitation.findFirst({
            where: { farmId, email, status: 'PENDING' }
        });
        if(existingInvitation) {
            return NextResponse.json({ error: 'An invitation for this email is already pending.' }, { status: 400 });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const invitation = await prisma.invitation.create({
            data: {
                farmId,
                email,
                role,
                token,
                expiresAt,
            },
        });
        
        // Here you would typically send an email with the invitation link
        // e.g., sendInvitationEmail(email, token);
        
        await log({
            userId: user.id,
            farmId,
            action: 'invite_user',
            details: `User ${user.name} invited ${email} with role ${role}`
        });

        return NextResponse.json(invitation, { status: 201 });
    } catch (error) {
        console.error('Error creating invitation:', error);
        return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }
}