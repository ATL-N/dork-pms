// app/api/auth/vet-signup/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ message: 'Qualification document is required.' }, { status: 400 });
        }

        // --- File Handling ---
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename to avoid overwrites
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const uploadPath = path.join(process.cwd(), 'public/uploads/vet-qualifications', filename);
        
        // Ensure the directory exists
        await require('fs').promises.mkdir(path.dirname(uploadPath), { recursive: true });

        await writeFile(uploadPath, buffer);
        const qualificationUrl = `/uploads/vet-qualifications/${filename}`;

        // --- User & Profile Creation ---
        const name = data.get('name');
        const email = data.get('email');
        const password = data.get('password');
        const specialization = data.get('specialization');
        const yearsExperience = parseInt(data.get('yearsExperience'), 10);
        const licenseNumber = data.get('licenseNumber');

        if (!name || !email || !password || !specialization || isNaN(yearsExperience)) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
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

        return NextResponse.json({ message: 'Application submitted successfully.' }, { status: 201 });

    } catch (error) {
        console.error('[API/VET-SIGNUP]', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
