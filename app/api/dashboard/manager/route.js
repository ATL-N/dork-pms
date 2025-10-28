// app/api/dashboard/manager/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const managerFarms = await prisma.farm.findMany({
        where: {
            users: {
                some: {
                    userId: currentUser.id,
                    role: 'MANAGER'
                }
            }
        },
        include: {
            flocks: { where: { status: 'ACTIVE' } },
            tasks: { where: { status: 'PENDING' } },
        }
    });

    let totalActiveFlocks = 0;
    let totalPendingTasks = 0;

    for(const farm of managerFarms) {
        totalActiveFlocks += farm.flocks.length;
        totalPendingTasks += farm.tasks.length;
    }

    // Note: Feed inventory and mortality rate are complex to aggregate meaningfully
    // across different farms without more specific business rules.
    // Returning mock data for now as in the previous implementation.
    const summary = {
      activeFlocks: totalActiveFlocks,
      feedInventory: 5250, // Mock
      mortalityRate: 1.8, // Mock
      pendingTasks: totalPendingTasks,
    };

    // Production data also needs farm-specific context or different aggregation.
    // Returning empty for now.
    return NextResponse.json({ summary, production: [], alerts: [], tasks: [] });

  } catch (error) {
    console.error('[API/DASHBOARD/MANAGER]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
