// app/api/auth/vet-signup/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as jose from 'jose';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ message: 'Qualification document is required.' }, { status: 400 });
        }

        // --- Upload file to Backblaze via internal API route ---
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
            method: 'POST',
            body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
            console.error('File upload failed:', uploadResult);
            return NextResponse.json({ message: 'Failed to upload qualification document.' }, { status: 500 });
        }
        
        const qualificationUrl = uploadResult.url;

        // --- User & Profile Creation ---
        const name = data.get('name');
        const email = data.get('email');
        const phoneNumber = data.get('phoneNumber');
        const password = data.get('password');
        const specialization = data.get('specialization');
        const yearsExperience = parseInt(data.get('yearsExperience'), 10);
        const licenseNumber = data.get('licenseNumber');

        if (!name || !email || !password || !specialization || !phoneNumber || isNaN(yearsExperience)) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phoneNumber }] },
        });
        if (existingUser) {
            return NextResponse.json({ message: 'A user with this email or phone number already exists.' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                passwordHash,
                userType: 'VET',
                vetProfile: {
                    create: {
                        specialization,
                        yearsExperience,
                        licenseNumber,
                        qualificationUrl,
                        approvalStatus: 'PENDING',
                    },
                },
            },
        });

        // Add user to General Chat
        try {
            const generalChat = await prisma.conversation.findFirst({
                where: { name: 'General Chat' },
            });
            if (generalChat) {
                await prisma.conversationParticipant.create({
                    data: {
                        conversationId: generalChat.id,
                        userId: newUser.id,
                    },
                });
            }
        } catch (chatError) {
            console.error("Failed to add user to General Chat:", chatError);
        }

        // --- Create JWT for auto-login ---
        const payload = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            userType: newUser.userType,
        };

        const secretString = process.env.NEXTAUTH_SECRET;
        if (!secretString) {
            console.error('JWT secret is not defined. Please set NEXTAUTH_SECRET in your .env file');
            // Still return success, but without a token, so user has to log in manually
            return NextResponse.json({ message: 'Application submitted! Please log in.' }, { status: 201 });
        }
        const secret = new TextEncoder().encode(secretString);

        const token = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(secret);
        
        // --- End Create JWT ---

        return NextResponse.json({ message: 'Application submitted successfully!', token: token }, { status: 201 });

    } catch (error) {
        console.error('[API/VET-SIGNUP]', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
