import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = parseFloat(searchParams.get('latitude'));
    const longitude = parseFloat(searchParams.get('longitude'));
    const radius = parseFloat(searchParams.get('radius'));
    const flockType = searchParams.get('flockType');

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
      return NextResponse.json({ error: 'Latitude, longitude, and radius are required and must be numbers.' }, { status: 400 });
    }

    const farms = await prisma.farm.findMany({
      where: {
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        ...(flockType && {
          flocks: {
            some: {
              type: flockType,
            },
          },
        }),
      },
      include: {
        owner: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
        farmSummary: {
          select: {
            totalEggsAvailable: true,
          }
        }
      },
    });

    const nearbyFarms = farms
      .map(farm => {
        const distance = calculateDistance(latitude, longitude, farm.latitude, farm.longitude);
        const { owner, farmSummary, ...rest } = farm;
        return {
          ...rest,
          distance,
          farmerName: owner.name,
          farmerPhone: owner.phoneNumber,
          hasEggsAvailable: (farmSummary?.totalEggsAvailable ?? 0) > 0,
        };
      })
      .filter(farm => farm.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    console.log('Farms found:', nearbyFarms);

    return NextResponse.json({
      success: true,
      count: nearbyFarms.length,
      radius,
      farms: nearbyFarms,
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to get nearby farms:', error);
    return NextResponse.json({ error: 'Failed to get nearby farms' }, { status: 500 });
  }
}
