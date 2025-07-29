// app/api/chat/conversations/[conversationId]/messages/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId } = await params;

    try {
        // Check if user is part of the conversation
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

        const messages = await prisma.message.findMany({
            where: { conversationId },
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
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
