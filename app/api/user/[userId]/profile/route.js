import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const session = await getSession({ req: request });
  const { userId } = await params;

  if (!session || session.user.id !== userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: session.user.userType === 'FARMER',
        vetProfile: session.user.userType === 'VET',
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    if (session.user.userType === 'FARMER') {
      return new Response(JSON.stringify(user.profile), { status: 200 });
    } else if (session.user.userType === 'VET') {
      return new Response(JSON.stringify(user.vetProfile), { status: 200 });
    } else {
      return new Response(JSON.stringify({}), { status: 200 }); // Or return basic user data
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), { status: 500 });
  }
}
