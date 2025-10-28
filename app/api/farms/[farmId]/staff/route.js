// app/api/farms/[farmId]/staff/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = await params;

  try {
    // Ensure the user is an owner or manager of this farm to view staff
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId,
        userId: user.id,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    });

    if (!farmUser && user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
      orderBy: { user: { name: 'asc' } },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error(`Error fetching staff for farm ${farmId}:`, error);
    return NextResponse.json({ error: 'Error fetching staff' }, { status: 500 });
  }
}
