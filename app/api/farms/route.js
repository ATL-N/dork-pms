import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    await logAction('WARN', 'Unauthorized access to search farms', { ip: request.ip });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search') || '';

  try {
    const farms = await prisma.farm.findMany({
      where: {
        users: {
            some: {
                userId: user.id,
            },
        },
      },
      // Select all fields needed by the client
      select: { 
        id: true, 
        name: true, 
        location: true, 
        ownerId: true, 
        createdAt: true, 
        updatedAt: true 
      },
    });
    await logAction('INFO', `User ${user.id} fetched their farms` , { userId: user.id });
    return new Response(JSON.stringify(farms), { status: 200 });
  } catch (error) {
    await logAction('ERROR', 'Failed to search farms', { userId: user.id, error: error.message });
    console.error("Failed to search farms:", error);
    return new Response(JSON.stringify({ error: 'Failed to search farms' }), { status: 500 });
  }
}

export async function POST(request) {
  const user = await getCurrentUser(request);

  // Only authenticated users can create farms
  if (!user || user.userType !== 'FARMER') {
    await logAction('WARN', 'Unauthorized attempt to create a farm', { userId: user?.id, ip: request.ip });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id: tempId, name, location, gpsAddress, latitude, longitude } = await request.json();

  if (!name) {
    await logAction('WARN', 'Farm creation attempt with no name', { userId: user.id });
    return new Response(JSON.stringify({ error: 'Farm name is required' }), { status: 400 });
  }

  try {
    const newFarm = await prisma.$transaction(async (tx) => {
      const farm = await tx.farm.create({
        data: {
          id: tempId,
          name,
          location,
          gpsAddress,
          latitude,
          longitude,
          owner: {
            connect: { id: user.id },
          },
          users: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });

      await tx.farmSummary.create({
        data: {
          farmId: farm.id,
          totalEggsAvailable: 0,
        },
      });

      return farm;
    });

    await logAction('INFO', `User created a new farm: ${name}` , { userId: user.id, farmId: newFarm.id });
    return new Response(JSON.stringify(newFarm), { status: 201 });
  } catch (error) {
    await logAction('ERROR', 'Failed to create farm', { userId: user.id, error: error.message });
    console.error("Failed to create farm:", error);
    return new Response(JSON.stringify({ error: 'Failed to create farm' }), { status: 500 });
  }
}
