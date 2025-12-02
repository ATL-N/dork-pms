import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import crypto from 'crypto';

/**
 * Generates a secure, digits-only OTP of a specified length.
 * @param {number} length The desired length of the OTP.
 * @returns {string} The generated OTP.
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    // The modulo operator introduces a small bias, but for OTP generation, it's generally acceptable.
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

/**
 * Hashes an OTP for secure storage.
 * @param {string} otp The plaintext OTP.
 * @returns {string} The hashed OTP.
 */
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    // Find the user by their phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // IMPORTANT: For security, do not reveal if a user exists or not.
      // Pretend to send an OTP even if the user is not found.
      // This prevents attackers from guessing which phone numbers are registered.
      console.log(`Password reset attempt for non-existent user with phone: ${phoneNumber}`);
      return NextResponse.json({ message: 'If an account with this phone number exists, an OTP has been sent.' });
    }

    // --- Best Practice: Clean up old tokens ---
    // Delete any previous password reset tokens for this user to prevent clutter
    // and ensure only the latest OTP is valid.
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        purpose: 'PASSWORD_RESET',
      },
    });

    // --- Generate and Store New Token ---
    const otp = generateOTP(6);
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP is valid for 10 minutes

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedOtp,
        expiresAt,
        purpose: 'PASSWORD_RESET',
      },
    });

    // --- Send OTP via Arkesel SMS API ---
    // Production-ready code should have more robust error handling for this call.
    const arkeselResponse = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': process.env.ARKESEL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: process.env.ARKESEL_SENDER_ID,
        message: `<#> Your Dork PMS password reset code is: ${otp}. This code is valid for 10 minutes.\nbbKc8B0B/Bd`,
        recipients: [phoneNumber],
      }),
    });

    if (!arkeselResponse.ok) {
        const errorBody = await arkeselResponse.text();
        console.error('Arkesel SMS API Error:', errorBody);
        // Even if SMS fails, we don't want to leak information.
        // The user can try again. We can log this for monitoring.
    }

    return NextResponse.json({ message: 'If an account with this phone number exists, an OTP has been sent.' });

  } catch (error) {
    console.error('Request Password Reset Error:', error);
    // Generic error message to prevent leaking implementation details
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}