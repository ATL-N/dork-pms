import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastSync = searchParams.get('lastSync');

    let whereClause = {};

    if (lastSync) {
      const lastSyncDate = new Date(lastSync);
      if (!isNaN(lastSyncDate)) {
        whereClause = {
          OR: [
            { createdAt: { gt: lastSyncDate } },
            { updatedAt: { gt: lastSyncDate } },
          ],
        };
      }
    }

    const taskTemplates = await prisma.taskTemplate.findMany({
      where: whereClause,
    });

    return NextResponse.json({ taskTemplates });
  } catch (error) {
    console.error('Error fetching task templates:', error);
    return NextResponse.json({ error: 'Failed to fetch task templates' }, { status: 500 });
  }
}