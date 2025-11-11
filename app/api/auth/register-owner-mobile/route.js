import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import * as jose from 'jose';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, name, password, phoneNumber } = await request.json();

    if (!email || !name || !password || !phoneNumber) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), { status: 409 });
    }

    const existingUserByPhone = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUserByPhone) {
      return new Response(JSON.stringify({ error: 'User with this phone number already exists' }), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        passwordHash,
        userType: 'FARMER',
        ownerApprovalStatus: 'PENDING',
      },
    });

    // Add user to General Chat
    try {
      const generalChat = await prisma.conversation.findFirst({
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
      // Non-critical error, so we don't block the registration
    }

    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      userType: newUser.userType,
    };

    const secretString = process.env.NEXTAUTH_SECRET;
    if (!secretString) {
        console.error('JWT secret is not defined. Please set NEXTAUTH_SECRET in your .env file');
        return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }
    const secret = new TextEncoder().encode(secretString);

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    return NextResponse.json({ token: token }, { status: 201 });

  } catch (error) {
    console.error("Owner registration error:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}