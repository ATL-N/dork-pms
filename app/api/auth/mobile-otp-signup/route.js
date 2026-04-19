import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, name } = await request.json();

    if (!userId || !name) {
      return NextResponse.json({ error: 'User ID and Name are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Update user name
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    // Add user to General Chat
    try {
      const generalChat = await prisma.conversation.findFirst({
        where: { name: 'General Chat' },
      });
      if (generalChat) {
        // Check if already a participant (unlikely, but safe)
        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: generalChat.id,
                    userId: updatedUser.id
                }
            }
        });

        if (!isParticipant) {
            await prisma.conversationParticipant.create({
                data: {
                    conversationId: generalChat.id,
                    userId: updatedUser.id,
                },
            });
        }
      }
    } catch (chatError) {
      console.error("Failed to add user to General Chat:", chatError);
    }

    // Generate JWT
    const payload = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      userType: updatedUser.userType,
    };

    const secretString = process.env.NEXTAUTH_SECRET;
    const secret = new TextEncoder().encode(secretString);

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    return NextResponse.json({ 
      success: true,
      token: token,
      user: { id: updatedUser.id, name: updatedUser.name, phoneNumber: updatedUser.phoneNumber }
    }, { status: 200 });

  } catch (error) {
    console.error('Mobile OTP signup error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
