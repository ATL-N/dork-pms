import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const MAX_OTP_ATTEMPTS = 5;

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
    const { phoneNumber, otp, newPassword } = await request.json();

    // --- Input Validation ---
    if (!phoneNumber || !otp || !newPassword) {
      return NextResponse.json({ error: 'Phone number, OTP, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // --- Find User and Token ---
    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      // Security: Do not reveal that the user doesn't exist.
      return NextResponse.json({ error: 'Invalid OTP or phone number.' }, { status: 400 });
    }

    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() }, // Check if the token is not expired
      },
      orderBy: {
        createdAt: 'desc', // Get the most recent token
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }
    
    // --- Brute-Force Protection ---
    if (tokenRecord.attempts >= MAX_OTP_ATTEMPTS) {
        return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 429 });
    }

    // --- Verify OTP ---
    const hashedOtp = hashOTP(otp);

    // Note: For production-grade security, consider using a timing-safe comparison function
    // like `crypto.timingSafeEqual` to prevent timing attacks, though it requires equal-length buffers.
    const isOtpValid = (hashedOtp === tokenRecord.token);

    if (!isOtpValid) {
      // Increment the attempt counter
      await prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'Invalid OTP or phone number.' }, { status: 400 });
    }

    // --- Update Password ---
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // --- Clean Up: Crucial Security Step ---
    // Delete the token immediately after successful use.
    await prisma.passwordResetToken.delete({
      where: { id: tokenRecord.id },
    });

    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}