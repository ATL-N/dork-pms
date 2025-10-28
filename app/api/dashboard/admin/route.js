// app/api/dashboard/admin/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { startOfMonth, subMonths } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // --- Existing Queries ---
    const userCount = await prisma.user.count({ where: { deletedAt: null } });
    const farmCount = await prisma.farm.count();
    const ownerRequests = await prisma.user.findMany({ where: { ownerApprovalStatus: 'PENDING' } });
    const vetRequests = await prisma.user.findMany({ where: { userType: 'VET', vetProfile: { approvalStatus: 'PENDING' } } });

    // --- New Analytics Queries ---
    
    // 1. Farm locations distribution
    const farmLocations = await prisma.farm.groupBy({
      by: ['location'],
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
      take: 10, // Top 10 locations
    });

    // 2. Total active birds
    const totalBirds = await prisma.flock.aggregate({
      _sum: { quantity: true },
      where: { status: 'ACTIVE' },
    });

    // 3. User sign-ups over the last 6 months
    const sixMonthsAgo = subMonths(new Date(), 6);
    const userSignups = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: { createdAt: true },
      where: { createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' },
    });
    
    // Process signups to be monthly
    const monthlySignups = userSignups.reduce((acc, { createdAt }) => {
        const month = startOfMonth(new Date(createdAt)).toISOString();
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    const userGrowthChartData = Object.keys(monthlySignups).map(month => ({
        date: new Date(month).toLocaleString('default', { month: 'short', year: '2-digit' }),
        count: monthlySignups[month],
    })).sort((a, b) => new Date(a.date) - new Date(b.date));


    return NextResponse.json({
      summary: {
        totalUsers: userCount,
        totalFarms: farmCount,
        totalBirds: totalBirds._sum.quantity || 0,
      },
      requests: {
        owners: { count: ownerRequests.length, data: ownerRequests },
        vets: { count: vetRequests.length, data: vetRequests },
      },
      analytics: {
        farmLocations: farmLocations.map(l => ({ name: l.location || 'Unknown', count: l._count.location })),
        userGrowth: userGrowthChartData,
      }
    });
  } catch (error) {
    console.error('[API/DASHBOARD/ADMIN]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
