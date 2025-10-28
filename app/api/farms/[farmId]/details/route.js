// app/api/farms/[farmId]/details/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { z } from 'zod';

const prisma = new PrismaClient();

const routeContextSchema = z.object({
  params: z.object({
    farmId: z.string(),
  }),
});

export async function GET(req, {params}) {
  try {
    
    const { farmId } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const farm = await prisma.farm.findUnique({
      where: {
        id: farmId,
      },
      include: {
        users: true, // Include the users associated with the farm
      },
    });

    if (!farm) {
      return new Response('Farm not found', { status: 404 });
    }

    // Authorization check: Ensure the current user is either the owner or a member of the farm
    const isOwner = farm.ownerId === currentUser.id;
    const isMember = farm.users.some(user => user.userId === currentUser.id);

    if (!isOwner && !isMember && currentUser.userType !== 'ADMIN') {
        return new Response("You don't have access to this farm", { status: 403 });
    }

    return NextResponse.json(farm);
  } catch (error) {
    console.error('Error fetching farm details:', error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
