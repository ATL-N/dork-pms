// app/api/veterinarians/[vetId]/reviews/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';

export async function GET(request, { params }) {
  const { vetId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  if (!vetId) {
    return NextResponse.json({ error: 'Veterinarian ID is required.' }, { status: 400 });
  }

  try {
    // Fetch reviews for the specified vet, including rater's info
    const reviews = await prisma.veterinarianRating.findMany({
      where: { veterinarianId: vetId },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalReviews = await prisma.veterinarianRating.count({
      where: { veterinarianId: vetId },
    });

    return NextResponse.json({
      reviews,
      total: totalReviews,
      page,
      limit,
      totalPages: Math.ceil(totalReviews / limit),
    });
  } catch (error) {
    console.error(`Error fetching reviews for vet ${vetId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { vetId } = await params;
  const { rating, comment } = await request.json();

  if (!vetId || rating === undefined || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Valid vetId and rating (1-5) are required.' }, { status: 400 });
  }

  try {
    let reviewToReturn;

    await prisma.$transaction(async (tx) => {
      const existingReview = await tx.veterinarianRating.findFirst({
        where: {
          raterId: user.id,
          veterinarianId: vetId,
        },
      });

      if (existingReview) {
        reviewToReturn = await tx.veterinarianRating.update({
          where: { id: existingReview.id },
          data: {
            rating,
            comment,
            createdAt: new Date(), // Update submission time
          },
          include: {
            rater: { select: { id: true, name: true, image: true } }
          }
        });
      } else {
        reviewToReturn = await tx.veterinarianRating.create({
          data: {
            rating,
            comment,
            raterId: user.id,
            veterinarianId: vetId,
          },
          include: {
            rater: { select: { id: true, name: true, image: true } }
          }
        });
        
        // Only increment ratingCount if it's a new review
        await tx.veterinarianProfile.update({
            where: { userId: vetId },
            data: { ratingCount: { increment: 1 } },
        });
      }

      // Recalculate average rating for the vet's profile
      const allRatings = await tx.veterinarianRating.findMany({
        where: { veterinarianId: vetId },
        select: { rating: true },
      });

      const totalRating = allRatings.reduce((acc, r) => acc + r.rating, 0);
      const newAverage = allRatings.length > 0 ? totalRating / allRatings.length : 0;

      await tx.veterinarianProfile.update({
        where: { userId: vetId },
        data: {
          averageRating: newAverage,
        },
      });
    });

    return NextResponse.json(reviewToReturn, { status: 201 });
  } catch (error) {
    console.error(`Error submitting review for vet ${vetId} by user ${user.id}:`, error);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}
