// app/api/farms/[farmId]/production-records/export/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

function jsonToCsv(items) {
    const header = Object.keys(items[0]);
    const headerString = header.join(',');

    const replacer = (key, value) => value ?? '';
    const rowItems = items.map((row) =>
        header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
    );
    
    return [headerString, ...rowItems].join('\r\n');
}

export async function GET(request, { params }) {
    const { farmId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const farmAccess = await prisma.farmUser.findUnique({
        where: { farmId_userId: { farmId, userId: user.id } },
    });

    if (!farmAccess && user.userType !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const flockId = searchParams.get('flockId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    if (format !== 'csv') {
        return NextResponse.json({ message: 'Unsupported format. Only CSV is available.' }, { status: 400 });
    }

    try {
        const whereClause = {
            flock: { farmId },
        };

        if (flockId) {
            whereClause.flockId = flockId;
        }
        if (startDate) {
            whereClause.date = { ...whereClause.date, gte: new Date(startDate) };
        }
        if (endDate) {
            whereClause.date = { ...whereClause.date, lte: new Date(endDate) };
        }

        const records = await prisma.eggProductionRecord.findMany({
            where: whereClause,
            include: {
                flock: {
                    select: { name: true }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        if (records.length === 0) {
            return NextResponse.json({ message: 'No records found for the selected criteria.' }, { status: 404 });
        }

        const formattedRecords = records.map(r => ({
            date: new Date(r.date).toISOString().split('T')[0],
            flockName: r.flock.name,
            totalEggs: r.totalEggs,
            brokenEggs: r.brokenEggs,
            averageWeight: r.averageWeight,
        }));

        const csv = jsonToCsv(formattedRecords);

        await logAction('INFO', `User ${user.id} exported production data for farm ${farmId}.`, { userId: user.id, farmId });

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="production-records-${farmId}.csv"`,
            },
        });

    } catch (error) {
        console.error("Failed to export production data:", error);
        await logAction('ERROR', `Failed to export production data for farm ${farmId}. Error: ${error.message}`, { userId: user.id, farmId, error: error.stack });
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}