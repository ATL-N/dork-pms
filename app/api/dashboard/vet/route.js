// app/api/dashboard/vet/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.userType !== 'VET') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const vetFarms = await prisma.vetFarmAccess.findMany({
      where: {
        veterinarianId: currentUser.id,
        status: 'ACTIVE',
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          }
        }
      }
    });

    const accessibleFarms = vetFarms.map(access => ({
        ...access.farm,
        // TODO: Implement a proper health status check
        healthStatus: 'Good' 
    }));

    return NextResponse.json(accessibleFarms);
  } catch (error) {
    console.error('[API/DASHBOARD/VET]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
