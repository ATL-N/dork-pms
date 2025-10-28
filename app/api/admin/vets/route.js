// app/api/admin/vets/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const vets = await prisma.user.findMany({
      where: {
        userType: 'VET',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        vetProfile: {
          select: {
            specialization: true,
            approvalStatus: true,
            qualificationUrl: true,
            yearsExperience: true,
          },
        },
      },
      orderBy: {
        vetProfile: {
            approvalStatus: 'asc' // Show PENDING vets first
        }
      }
    });

    return NextResponse.json(vets);
  } catch (error) {
    console.error('[API/ADMIN/VETS]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req) {
    const currentUser = await getCurrentUser(req);

    if (!currentUser || currentUser.userType !== 'ADMIN') {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { vetId, status } = await req.json();

        if (!vetId || !['APPROVED', 'REJECTED'].includes(status)) {
            return new Response(JSON.stringify({ message: 'Invalid request data.' }), { status: 400 });
        }

        await prisma.veterinarianProfile.update({
            where: { userId: vetId },
            data: { 
                approvalStatus: status,
                isVerified: status === 'APPROVED', // Also set the isVerified flag
            },
        });

        return NextResponse.json({ message: `Veterinarian status updated to ${status}.` });

    } catch (error) {
        console.error('[API/ADMIN/VETS/UPDATE]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
