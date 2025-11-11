import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json({ message: 'If an account with that phone number exists, a reset code has been sent.' });
    }

    // Generate a 6-digit token
    const token = crypto.randomInt(100000, 999999).toString();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Set expiry for 10 minutes
    const expires = new Date(new Date().getTime() + 10 * 60 * 1000);

    // Store the hashed token in the database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expires,
      },
    });

    // In a real app, you would send the token via SMS/WhatsApp using Arkesel API here
    console.log(`Password reset token for ${phoneNumber}: ${token}`);

    // For demonstration purposes, we return the token in the response
    return NextResponse.json({ message: 'A reset code has been sent to your phone.', token });

  } catch (error) {
    console.error('Request password reset error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
