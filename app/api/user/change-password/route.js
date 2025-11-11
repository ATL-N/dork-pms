import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: 'Old and new passwords are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const passwordsMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Incorrect old password' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
