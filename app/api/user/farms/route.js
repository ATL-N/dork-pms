
// app/api/user/farms/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const farmUsers = await prisma.farmUser.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        farm: true,
      },
    });

    const ownedFarms = await prisma.farm.findMany({
        where: {
            ownerId: currentUser.id,
        }
    });

    // Combine owned farms and farms the user is a member of
    const allFarmAccess = [...farmUsers];
    
    // Add owned farms if they aren't already in the list from FarmUser
    ownedFarms.forEach(ownedFarm => {
        if (!allFarmAccess.some(fu => fu.farmId === ownedFarm.id)) {
            allFarmAccess.push({
                farmId: ownedFarm.id,
                userId: currentUser.id,
                role: 'OWNER', // Assign role explicitly for owner
                farm: ownedFarm,
            });
        }
    });


    const farmsWithRoles = allFarmAccess.map(({ farm, role }) => ({
      id: farm.id,
      name: farm.name,
      location: farm.location,
      role: role, // Include the user's role for this farm
    }));

    return NextResponse.json(farmsWithRoles);
  } catch (error) {
    console.error('Error fetching user farms:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

