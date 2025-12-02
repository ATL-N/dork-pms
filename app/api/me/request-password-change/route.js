// app/api/me/request-password-change/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import crypto from 'crypto';
import { getCurrentUser } from '@/app/lib/session';

function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user || !user.phoneNumber) {
        return NextResponse.json({ error: 'User not found or no phone number on file.' }, { status: 400 });
    }

    // Clean up old tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        purpose: 'PASSWORD_CHANGE',
      },
    });

    // Generate and Store New Token
    const otp = generateOTP(6);
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedOtp,
        expiresAt,
        purpose: 'PASSWORD_CHANGE',
      },
    });

    // Send OTP via Arkesel - SIMPLIFIED MESSAGE
    const arkeselResponse = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': process.env.ARKESEL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: process.env.ARKESEL_SENDER_ID,
        message: `Your Dork PMS password change code is ${otp}. Valid for 10 minutes. Do not share.`,
        recipients: [user.phoneNumber],
      }),
    });

    if (!arkeselResponse.ok) {
        const errorBody = await arkeselResponse.text();
        console.error('Arkesel SMS API Error:', errorBody);
        return NextResponse.json({ error: 'Failed to send security code.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'A security code has been sent to your registered phone number.' });

  } catch (error) {
    console.error('Request Password Change Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}