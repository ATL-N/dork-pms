// app/api/admin/logs/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();
const LOGS_PER_PAGE = 20;

export async function GET(req) {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.userType !== 'ADMIN') {
        return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const searchTerm = searchParams.get('searchTerm');
    const level = searchParams.get('level');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        const skip = (page - 1) * LOGS_PER_PAGE;
        
        const where = {};
        if (level) {
            where.level = level;
        }
        if (startDate) {
            where.timestamp = { ...where.timestamp, gte: new Date(startDate) };
        }
        if (endDate) {
            const date = new Date(endDate);
            date.setDate(date.getDate() + 1);
            where.timestamp = { ...where.timestamp, lt: date };
        }
        if (searchTerm) {
            where.OR = [
                { message: { contains: searchTerm, mode: 'insensitive' } },
                { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
            ];
        }

        const logs = await prisma.log.findMany({
            where,
            take: LOGS_PER_PAGE,
            skip: skip,
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        const totalLogs = await prisma.log.count({ where });
        const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);

        return NextResponse.json({
            logs,
            currentPage: page,
            totalPages,
        });

    } catch (error) {
        console.error('[API/ADMIN/LOGS/GET]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
