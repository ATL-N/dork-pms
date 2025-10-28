// app/api/chat/conversations/[conversationId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId } = await params;

    try {
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                conversationId: conversationId,
                userId: user.id,
            },
        });

        if (!participant) {
            return NextResponse.json({ error: 'You are not a participant of this conversation' }, { status: 403 });
        }

        await prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId: conversationId,
                    userId: user.id,
                },
            },
            data: {
                isHidden: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error hiding conversation ${conversationId} for user ${user.id}:`, error);
        return NextResponse.json({ error: 'Failed to hide conversation' }, { status: 500 });
    }
}
