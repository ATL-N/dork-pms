// app/api/veterinarians/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vets = await prisma.user.findMany({
      where: {
        userType: 'VET',
        vetProfile: {
          isVerified: true,
        },
      },
      select: {
        id: true,
        name: true,
        email: true, // Included for a "contact" button, but handle with care on the frontend
        image: true,
        profile: {
          select: {
            country: true,
          }
        },
        vetProfile: {
          select: {
            specialization: true,
            averageRating: true,
            ratingCount: true,
          },
        },
      },
    });

    return NextResponse.json(vets);
  } catch (error) {
    console.error('[API/VETERINARIANS]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
