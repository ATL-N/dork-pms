import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { phoneNumber, token, newPassword } = await request.json();

    if (!phoneNumber || !token || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid token or phone number' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        expires: 'desc',
      },
    });

    if (!resetToken) {
      return NextResponse.json({ message: 'Invalid token or phone number' }, { status: 400 });
    }

    if (new Date() > resetToken.expires) {
      return NextResponse.json({ message: 'Token has expired' }, { status: 400 });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (hashedToken !== resetToken.token) {
      return NextResponse.json({ message: 'Invalid token or phone number' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
