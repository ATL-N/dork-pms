import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lastSync = searchParams.get('lastSync');

  try {
    const whereClause = lastSync
      ? {
          updatedAt: {
            gt: new Date(lastSync),
          },
        }
      : {};

    const breeds = await prisma.breed.findMany({ where: whereClause });
    const benchmarks = await prisma.standardBenchmark.findMany({ where: whereClause });

    return NextResponse.json({
      breeds,
      benchmarks,
    });
  } catch (error) {
    console.error('Error fetching benchmark data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmark data' },
      { status: 500 }
    );
  }
}
