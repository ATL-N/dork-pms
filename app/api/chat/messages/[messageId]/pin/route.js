// app/api/chat/messages/[messageId]/pin/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { messageId } = params;
    const { isPinned } = await request.json();

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                conversation: {
                    include: {
                        participants: true,
                    },
                },
            },
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        const isParticipant = message.conversation.participants.some(p => p.userId === user.id);
        if (!isParticipant) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { isPinned },
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error('Error updating pin status:', error);
        return NextResponse.json({ error: 'Failed to update pin status' }, { status: 500 });
    }
}
