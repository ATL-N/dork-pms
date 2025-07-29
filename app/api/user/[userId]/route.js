import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const session = await getSession({ req: request });
  const { userId } = params;

  if (!session || session.user.id !== userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { name, email, contact, specialization, licenseNumber } = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
      },
    });

    if (session.user.userType === 'VET') {
      await prisma.veterinarianProfile.upsert({
        where: { userId: userId },
        update: {
          specialization: specialization || undefined,
          licenseNumber: licenseNumber || undefined,
        },
        create: {
          userId: userId,
          specialization: specialization || undefined,
          licenseNumber: licenseNumber || undefined,
        },
      });
    } else if (session.user.userType === 'FARMER') {
      await prisma.userProfile.upsert({
        where: { userId: userId },
        update: {
          contact: contact || undefined,
        },
        create: {
          userId: userId,
          contact: contact || undefined,
        },
      });
    }

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return new Response(JSON.stringify({ error: 'Failed to update user profile' }), { status: 500 });
  }
}
