// app/api/users/route.js
import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/session';


export async function GET(request) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: user.id // Exclude the current user from the list
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                userType: true,
                farms: { // Corrected from farmUsers to farms
                    select: {
                        farmId: true
                    }
                }
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Get the current user's farm IDs
        const currentUserFarms = await prisma.farmUser.findMany({
            where: { userId: user.id },
            select: { farmId: true }
        });
        const currentUserFarmIds = new Set(currentUserFarms.map(fu => fu.farmId));

        // Add isSameFarm flag to each user
        const usersWithFarmInfo = users.map(u => {
            const hasCommonFarm = u.farms.some(fu => currentUserFarmIds.has(fu.farmId));
            return { ...u, isSameFarm: hasCommonFarm };
        });

        return NextResponse.json(usersWithFarmInfo);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
