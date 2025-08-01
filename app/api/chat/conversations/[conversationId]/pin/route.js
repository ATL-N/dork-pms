// app/api/chat/conversations/[conversationId]/pin/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId } = params;

    try {
        const existingPin = await prisma.pinnedConversation.findFirst({
            where: {
                userId: user.id,
                conversationId,
            },
        });

        if (existingPin) {
            return NextResponse.json({ message: 'Conversation already pinned' }, { status: 200 });
        }

        await prisma.pinnedConversation.create({
            data: {
                userId: user.id,
                conversationId,
            },
        });

        return NextResponse.json({ message: 'Conversation pinned' }, { status: 200 });
    } catch (error) {
        console.error('Error pinning conversation:', error);
        return NextResponse.json({ error: 'Failed to pin conversation' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId } = params;
    const { userId } = await request.json();

    try {
        if (user.userType === 'ADMIN' && userId) {
            // Admin can unpin for a specific user
            await prisma.pinnedConversation.deleteMany({
                where: {
                    userId: userId,
                    conversationId,
                },
            });
            return NextResponse.json({ message: `Conversation unpinned for user ${userId}` }, { status: 200 });
        }

        // Regular user unpins for themselves
        await prisma.pinnedConversation.deleteMany({
            where: {
                userId: user.id,
                conversationId,
            },
        });

        return NextResponse.json({ message: 'Conversation unpinned' }, { status: 200 });
    } catch (error) {
        console.error('Error unpinning conversation:', error);
        return NextResponse.json({ error: 'Failed to unpin conversation' }, { status: 500 });
    }
}
