import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

// GET /api/staff?farmId=<farmId>
// Gets all staff members for a given farm
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    if (!farmId) {
      return NextResponse.json({ error: 'Farm ID is required' }, { status: 400 });
    }

    // Check if the current user has rights to view staff (is a member of the farm)
    const userAccess = await prisma.farmUser.findFirst({
        where: {
            farmId: farmId,
            userId: currentUser.id,
        }
    });

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });

    if (!userAccess && farm?.ownerId !== currentUser.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const staff = await prisma.farmUser.findMany({
      where: { farmId: farmId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// POST /api/staff
// Directly adds a new worker to a farm
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { farmId, name, email, password, role } = await request.json();

    if (!farmId || !name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Authorization: Check if current user is OWNER or MANAGER of the farm
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    const userAccess = await prisma.farmUser.findFirst({
        where: { farmId: farmId, userId: currentUser.id }
    });

    const canManageStaff = farm?.ownerId === currentUser.id || userAccess?.role === 'MANAGER';

    if (!canManageStaff) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        // If user exists, check if they are already on the farm
        const existingFarmUser = await prisma.farmUser.findFirst({
            where: { farmId, userId: user.id }
        });
        if (existingFarmUser) {
            return NextResponse.json({ error: 'User is already a member of this farm' }, { status: 409 });
        }
    } else {
        // User does not exist, create them with the provided password
        const passwordHash = await bcrypt.hash(password, 10);

        user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                userType: 'FARMER', // All staff are FARMER type
            },
        });
    }

    // Add user to the farm
    const newFarmUser = await prisma.farmUser.create({
      data: {
        farmId,
        userId: user.id,
        role, // 'WORKER' or 'MANAGER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(newFarmUser, { status: 201 });

  } catch (error) {
    console.error('Error adding worker:', error);
    if (error.code === 'P2002') { // Unique constraint failed (email)
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}