import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as jose from 'jose';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // 1. Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Compare the provided password with the stored hash
    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 3. If credentials are valid, create a JWT using 'jose'
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
    };

    const secretString = process.env.NEXTAUTH_SECRET;
    if (!secretString) {
        console.error('JWT secret is not defined. Please set NEXTAUTH_SECRET in your .env file');
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }
    const secret = new TextEncoder().encode(secretString);

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    // 4. Return the token to the client
    return NextResponse.json({ token: token }, { status: 200 });

  } catch (error) {
    console.error('Mobile sign-in error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}