// app/api/farms/[farmId]/vet-access/invite/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const farmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id, role: { in: ['OWNER', 'MANAGER'] } },
        });

        if (!farmUser) {
            return NextResponse.json({ error: 'You do not have permission to invite veterinarians to this farm.' }, { status: 403 });
        }

        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        // Find the veterinarian by email
        const veterinarian = await prisma.user.findUnique({
            where: { email, userType: 'VET' },
        });

        if (!veterinarian) {
            // If the vet doesn't exist, we can't send a request yet.
            // For now, we'll return an error. In the future, this could create an invitation record.
            return NextResponse.json({ error: 'No veterinarian found with this email. Please ensure they have a Vet account.' }, { status: 404 });
        }

        // Check if a request already exists
        const existingRequest = await prisma.vetAccessRequest.findFirst({
            where: {
                farmId,
                veterinarianId: veterinarian.id,
            },
        });

        if (existingRequest) {
            return NextResponse.json({ error: 'An invitation has already been sent to this veterinarian.' }, { status: 409 });
        }

        // Create the access request
        const newRequest = await prisma.vetAccessRequest.create({
            data: {
                farmId,
                veterinarianId: veterinarian.id,
                status: 'PENDING',
            },
        });

        await log({
            level: "INFO",
            message: `User ${user.email} invited veterinarian ${email} to farm ${farmId}.`,
            userId: user.id,
            meta: { farmId, vetEmail: email },
        });

        return NextResponse.json(newRequest, { status: 201 });

    } catch (error) {
        await log({
            level: "ERROR",
            message: `Failed to invite veterinarian to farm ${farmId}. Error: ${error.message}`,
            userId: user.id,
            meta: { farmId, stack: error.stack },
        });
        return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
    }
}
