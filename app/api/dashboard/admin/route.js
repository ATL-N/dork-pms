// app/api/dashboard/admin/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const userCount = await prisma.user.count();
    const farmCount = await prisma.farm.count();
    const ownerRequests = await prisma.user.findMany({
      where: {
        ownerApprovalStatus: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      users: {
        total: userCount,
      },
      farms: {
        total: farmCount,
      },
      ownerRequests: {
        count: ownerRequests.length,
        requests: ownerRequests,
      }
    });
  } catch (error) {
    console.error('[API/DASHBOARD/ADMIN]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
