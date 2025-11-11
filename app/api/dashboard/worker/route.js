// app/api/dashboard/worker/route.js
import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
        where: {
            assignedToId: currentUser.id,
            status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        include: {
            farm: {
                select: { name: true }
            }
        }
    });

    // For workers, alerts might be farm-specific and pushed through a different mechanism.
    // For now, returning an empty array.
    return NextResponse.json({ tasks, alerts: [] });

  } catch (error) {
    console.error('[API/DASHBOARD/WORKER]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
