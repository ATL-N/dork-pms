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

function getBirdsForSale(farm) {
    const birdsForSale = new Set();
    if (!farm.flocks) {
        return [];
    }

    const now = new Date();

    for (const flock of farm.flocks) {
        if (flock.status !== 'ACTIVE') {
            continue;
        }

        const acquisitionDate = new Date(flock.acquisitionDate);
        const ageInWeeks = (now - acquisitionDate) / (1000 * 60 * 60 * 24 * 7);

        switch (flock.flockType) {
            case 'BROILER':
                if (ageInWeeks >= 6) {
                    birdsForSale.add('Broilers');
                }
                break;
            case 'LAYER':
                const productionRate = flock.productionPercentage || 0;
                if (ageInWeeks >= 74 || productionRate < 66) {
                    birdsForSale.add('Layers');
                }
                break;
            case 'BREEDER':
                if (ageInWeeks >= 65) {
                    birdsForSale.add('Breeders');
                }
                break;
        }
    }

    return Array.from(birdsForSale);
}


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = parseFloat(searchParams.get('latitude'));
    const longitude = parseFloat(searchParams.get('longitude'));
    const radius = parseFloat(searchParams.get('radius'));
    const availability = searchParams.get('availability')?.split(',');

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
        },
        flocks: { // Include active flocks
          where: {
            status: 'ACTIVE'
          }
        }
      },
    });

    const farmIds = farms.map(f => f.id);
    const eggSaleAggregates = await prisma.eggSale.groupBy({
      by: ['farmId'],
      where: {
        farmId: { in: farmIds },
      },
      _sum: {
        amount: true,
        quantity: true,
      },
    });

    const aggregatesMap = new Map(
      eggSaleAggregates.map(agg => [agg.farmId, agg._sum])
    );

    let nearbyFarms = farms
      .map(farm => {
        const distance = calculateDistance(latitude, longitude, farm.latitude, farm.longitude);
        const birdsForSale = getBirdsForSale(farm);
        
        const farmAggregates = aggregatesMap.get(farm.id);
        let avgCratePrice = null;
        if (farmAggregates && farmAggregates.quantity > 0) {
          const avgPricePerEgg = farmAggregates.amount / farmAggregates.quantity;
          avgCratePrice = avgPricePerEgg * 30;
        }

        const { owner, farmSummary, flocks, ...rest } = farm;
        return {
          ...rest,
          distance,
          farmerName: owner.name,
          farmerPhone: owner.phoneNumber,
          hasEggsAvailable: (farmSummary?.totalEggsAvailable ?? 0) > 0,
          birdsForSale: birdsForSale,
          avgCratePrice: avgCratePrice,
        };
      })
      .filter(farm => farm.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    // Apply availability filters if they exist
    if (availability && availability.length > 0) {
      nearbyFarms = nearbyFarms.filter(farm => {
        return availability.every(filter => {
          switch (filter) {
            case 'eggs':
              return farm.hasEggsAvailable;
            case 'broilers':
              return farm.birdsForSale.includes('Broilers');
            case 'layers':
              return farm.birdsForSale.includes('Layers');
            case 'breeders':
              return farm.birdsForSale.includes('Breeders');
            default:
              return true; // Ignore unknown filters
          }
        });
      });
    }

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
