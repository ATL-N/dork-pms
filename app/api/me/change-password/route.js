
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/app/lib/session';

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
    // --- Authentication ---
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otp, newPassword } = await request.json();

    // --- Input Validation ---
    if (!otp || !newPassword) {
      return NextResponse.json({ error: 'OTP and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // --- Find Token ---
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: currentUser.id,
        purpose: 'PASSWORD_CHANGE',
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired security code.' }, { status: 400 });
    }

    // --- Brute-Force Protection ---
    if (tokenRecord.attempts >= MAX_OTP_ATTEMPTS) {
        return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new security code.' }, { status: 429 });
    }

    // --- Verify OTP ---
    const hashedOtp = hashOTP(otp);
    const isOtpValid = (hashedOtp === tokenRecord.token);

    if (!isOtpValid) {
      await prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'Invalid security code.' }, { status: 400 });
    }

    // --- Update Password ---
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash: newPasswordHash },
    });

    // --- Clean Up ---
    await prisma.passwordResetToken.delete({
      where: { id: tokenRecord.id },
    });

    return NextResponse.json({ message: 'Password has been changed successfully.' });

  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}
