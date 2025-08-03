// app/api/staff/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import bcrypt from 'bcrypt';
import { logAction } from '@/app/lib/logging';

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

export async function POST(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // For now, only farm owners can add staff. This can be expanded later.
    const isOwner = currentUser.isOwner;
    if (!isOwner) {
        return NextResponse.json({ error: 'Only farm owners can add new staff.' }, { status: 403 });
    }

    try {
        const { name, email, password, contact, role, farmIds } = await request.json();

        if (!name || !email || !password || !role || !farmIds || farmIds.length === 0) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                userType: 'FARMER',
                emailVerified: new Date(), // Owner is creating the user directly
                profile: {
                    create: {
                        contact,
                        hireDate: new Date(),
                    },
                },
                farms: {
                    create: farmIds.map(farmId => ({
                        farmId: farmId,
                        role: role,
                    })),
                },
            },
            include: {
                profile: true,
                farms: true,
            }
        });
        
        await logAction('INFO', `Owner ${currentUser.name} added new staff: ${newUser.name}`, { ownerId: currentUser.id, newUserId: newUser.id });

        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        console.error('Error adding staff:', error);
        await logAction('ERROR', `Failed to add staff`, { ownerId: currentUser.id, error: error.message });
        return NextResponse.json({ error: 'Failed to add staff member.' }, { status: 500 });
    }
}
