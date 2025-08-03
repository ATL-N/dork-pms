// app/api/admin/veterinarians/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { name, email, password, specialization, licenseNumber, country } = await req.json();

    if (!name || !email || !password || !specialization) {
        return new Response(JSON.stringify({ message: 'Missing required fields.' }), { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return new Response(JSON.stringify({ message: 'A user with this email already exists.' }), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        userType: 'VET',
        emailVerified: new Date(), // Admins create verified users directly
        profile: {
          create: {
            country,
          }
        },
        vetProfile: {
          create: {
            specialization,
            licenseNumber,
            isVerified: true,
          },
        },
      },
    });

    // Exclude password from response
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    // Add user to General Chat
    try {
        const generalChat = await prisma.conversation.findUnique({
            where: { name: 'General Chat' },
        });
        if (generalChat) {
            await prisma.conversationParticipant.create({
                data: {
                    conversationId: generalChat.id,
                    userId: newUser.id,
                },
            });
        }
    } catch (chatError) {
        console.error("Failed to add user to General Chat:", chatError);
    }
    
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('[API/ADMIN/VETERINARIANS]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
