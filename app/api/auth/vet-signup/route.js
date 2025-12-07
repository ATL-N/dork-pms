// app/api/auth/vet-signup/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
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
                        qualificationUrl, // Use the URL from the upload service
                        approvalStatus: 'PENDING',
                    },
                },
            },
        });

        // Add user to General Chat
        try {
            const generalChat = await prisma.conversation.findUnique({
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

        return NextResponse.json({ message: 'Application submitted successfully.' }, { status: 201 });

    } catch (error) {
        console.error('[API/VET-SIGNUP]', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
