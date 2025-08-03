// app/api/chat/messages/[messageId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { messageId } = params;

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (message.senderId !== user.id) {
            return NextResponse.json({ error: 'You are not authorized to delete this message' }, { status: 403 });
        }

        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
                deletedAt: new Date(),
                content: 'This message has been deleted.',
                mediaUrl: null,
                mediaType: null,
            },
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error(`Error deleting message ${messageId}:`, error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
