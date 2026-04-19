import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimiter } from '@/app/lib/redis';
import { generateOTP, hashOTP } from '@/app/lib/otp';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    // --- Rate Limiting ---
    // limit: 3, duration: 20 minutes (1200 seconds)
    const limit = 3;
    const duration = 1200;
    const { allowed } = await rateLimiter('sms-otp-login', phoneNumber, limit, duration);

    if (!allowed) {
      return NextResponse.json({ 
        error: 'Too many OTP requests. Please try again in 20 minutes.' 
      }, { status: 429 });
    }
    // --- End Rate Limiting ---

    // Generate 6-digit OTP
    const otp = generateOTP(6);
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store/Update OTP for this user (even if not registered yet, we store against phone)
    // Actually, PasswordResetToken table expects a userId. 
    // If the user doesn't exist yet, we have a problem.
    // Let's check if the user exists.

    let user = await prisma.user.findUnique({
        where: { phoneNumber }
    });

    // If user doesn't exist, we'll create a "shadow" user or handle it differently.
    // Better: let's use a temporary table or create a user with dummy name/email if they don't exist?
    // Actually, I can just create a basic user record if they don't exist.
    
    if (!user) {
        user = await prisma.user.create({
            data: {
                phoneNumber,
                userType: 'FARMER', // Default
                ownerApprovalStatus: 'PENDING',
            }
        });
    }

    // Clean up old LOGIN tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        purpose: 'LOGIN',
      },
    });

    // Create the new token
    await prisma.passwordResetToken.create({
      data: {
        token: hashedOtp,
        expiresAt: expiresAt,
        userId: user.id,
        purpose: 'LOGIN',
      },
    });

    // --- Send OTP via Arkesel SMS API ---
    // In production, you would use your Arkesel API Key from .env
    const arkeselApiKey = process.env.ARKESEL_API_KEY;
    const senderId = process.env.ARKESEL_SENDER_ID || 'DorkPMS';

    try {
        const arkeselResponse = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': arkeselApiKey,
            },
            body: JSON.stringify({
                sender: senderId,
                recipients: [phoneNumber],
                message: `<#> Your Dork PMS login code is: ${otp}. This code is valid for 10 minutes.\nbbKc8B0B/Bd`,
            }),
        });

        if (!arkeselResponse.ok) {
            const errorBody = await arkeselResponse.json();
            console.error('Arkesel SMS API Error:', errorBody);
            // We'll still return success to the user (mock behavior in dev if API key missing)
        }
    } catch (error) {
        console.error('Failed to send SMS via Arkesel:', error);
    }

    // For development, if you don't have Arkesel set up, you can log it.
    console.log(`[DEV] OTP for ${phoneNumber} is: ${otp}`);

    return NextResponse.json({ 
        message: 'OTP has been sent to your phone number.',
        isNewUser: !user.name // If name is missing, they need to sign up after verification
    });

  } catch (error) {
    console.error('Mobile OTP request error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
