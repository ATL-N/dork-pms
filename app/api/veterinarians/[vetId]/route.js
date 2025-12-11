// app/api/veterinarians/[vetId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  const { vetId } = await params;

  if (!vetId) {
    return NextResponse.json({ error: 'Veterinarian ID is required.' }, { status: 400 });
  }

  try {
    const vet = await prisma.user.findUnique({
      where: {
        id: vetId,
        userType: 'VET',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        createdAt: true,
        vetProfile: {
          select: {
            specialization: true,
            yearsExperience: true,
            isVerified: true,
            approvalStatus: true,
            averageRating: true,
            ratingCount: true,
          },
        },
      },
    });

    if (!vet) {
      return NextResponse.json({ error: 'Veterinarian not found.' }, { status: 404 });
    }

    // Flatten the profile for easier consumption on the frontend
    const { vetProfile, ...user } = vet;
    const response = {
        ...user,
        ...vetProfile,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching vet ${vetId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch veterinarian details.' }, { status: 500 });
  }
}
