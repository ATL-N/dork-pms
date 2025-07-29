import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getUserFarmRole } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { flockId, quantity, revenue, date, notes } = await request.json();

  if (!flockId || !quantity || !revenue || !date) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    // Create a new BirdResale record
    const newResale = await prisma.birdResale.create({
      data: {
        flockId,
        quantity,
        revenue,
        date: new Date(date),
        notes,
        recordedById: userId,
      },
    });

    // Optionally, update the flock quantity (decrease by sold quantity)
    await prisma.flock.update({
      where: { id: flockId },
      data: {
        quantity: { decrement: quantity },
      },
    });

    return new Response(JSON.stringify(newResale), { status: 201 });
  } catch (error) {
    console.error("Failed to record bird resale:", error);
    return new Response(JSON.stringify({ error: 'Failed to record bird resale' }), { status: 500 });
  }
}

export async function GET(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (!role) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const resales = await prisma.birdResale.findMany({
      where: {
        flock: {
          farmId: farmId,
        },
      },
      include: { flock: true, recordedBy: true },
      orderBy: { date: 'desc' },
    });
    return new Response(JSON.stringify(resales), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch bird resales:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch bird resales' }), { status: 500 });
  }
}
