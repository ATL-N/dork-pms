// app/api/chat/conversations/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function GET(request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        // Ensure the user is in the General Chat
        let generalChat = await prisma.conversation.findFirst({
            where: { name: 'General Chat' },
        });

        if (generalChat) {
            const isParticipant = await prisma.conversationParticipant.findFirst({
                where: {
                    conversationId: generalChat.id,
                    userId: user.id,
                },
            });

            if (!isParticipant) {
                await prisma.conversationParticipant.create({
                    data: {
                        conversationId: generalChat.id,
                        userId: user.id,
                    },
                });
            }
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: user.id,
                        isHidden: false,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, image: true },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
                pinnedBy: {
                    where: {
                        userId: user.id,
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        const conversationsWithPinnedStatus = conversations.map(c => ({
            ...c,
            isPinned: c.pinnedBy.length > 0,
        }));

        return NextResponse.json(conversationsWithPinnedStatus);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

export async function POST(request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { userIds, name } = await request.json();
    const allParticipantIds = [...new Set([user.id, ...userIds])];

    if (allParticipantIds.length < 2) {
        return NextResponse.json({ error: 'A conversation requires at least two participants.' }, { status: 400 });
    }

    try {
        const newConversation = await prisma.conversation.create({
            data: {
                name: name,
                isGroup: allParticipantIds.length > 2,
                participants: {
                    create: allParticipantIds.map(id => ({
                        user: { connect: { id } }
                    })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, image: true } }
                    }
                },
                messages: true
            }
        });

        return NextResponse.json(newConversation, { status: 201 });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }
}
