// app/api/chat/messages/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function POST(request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId, content, mediaUrl, mediaType, repliedToId } = await request.json();

    if (!conversationId || (!content && !mediaUrl)) {
        return NextResponse.json({ error: 'conversationId and content or mediaUrl are required' }, { status: 400 });
    }

    try {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId: user.id,
                    },
                },
            },
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Access denied or conversation not found' }, { status: 403 });
        }

        const newMessage = await prisma.message.create({
            data: {
                content: content || '',
                mediaUrl,
                mediaType,
                conversationId,
                senderId: user.id,
                repliedToId,
            },
            include: {
                sender: {
                    select: { id: true, name: true, image: true },
                },
                repliedTo: {
                    include: {
                        sender: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
        });

        // Update conversation's updatedAt for sorting
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        
        // No log here, as it would be too noisy. Chat actions are not typically logged for audit.

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
