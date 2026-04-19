import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';
import { hashOTP } from '@/app/lib/otp';

const prisma = new PrismaClient();
const MAX_OTP_ATTEMPTS = 5;

export async function POST(request) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found. Please request a new OTP.' }, { status: 404 });
    }

    // Find the latest valid LOGIN token
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        purpose: 'LOGIN',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 400 });
    }

    if (new Date() > tokenRecord.expiresAt) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (tokenRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 429 });
    }

    // Verify OTP
    const hashedOtp = hashOTP(otp);
    if (hashedOtp !== tokenRecord.token) {
      // Increment attempts
      await prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }

    // --- OTP is Valid ---

    // Delete the token
    await prisma.passwordResetToken.delete({
      where: { id: tokenRecord.id },
    });

    // If user is already "complete" (has a name), log them in
    if (user.name) {
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
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
        isNewUser: false,
        user: { id: user.id, name: user.name, phoneNumber: user.phoneNumber }
      }, { status: 200 });
    }

    // If user doesn't have a name, return success but no token (need name entry)
    return NextResponse.json({ 
      success: true,
      isNewUser: true,
      userId: user.id, // Pass userId for the next step (signup)
      message: 'OTP verified. Please complete your profile.'
    }, { status: 200 });

  } catch (error) {
    console.error('Mobile OTP verify error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
