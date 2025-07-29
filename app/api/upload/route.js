// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
        
        // Ensure the upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        const newPath = path.join(uploadDir, fileName);

        await fs.writeFile(newPath, buffer);

        const fileUrl = `/uploads/chat/${fileName}`;

        return NextResponse.json({ success: true, url: fileUrl, type: file.type });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ success: false, error: 'File upload failed' }, { status: 500 });
    }
}