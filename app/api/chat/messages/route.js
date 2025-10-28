// app/api/chat/messages/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { log } from '@/app/lib/logging';

const prisma = new PrismaClient();

export async function POST(request) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId, content, mediaUrl, mediaType, repliedToId, id: clientSideId } = await request.json();

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
                id: clientSideId, // Use the ID from the client
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

        // Broadcast the new message to the WebSocket server
        console.log('[API] Attempting to broadcast message...');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout

            const broadcastResponse = await fetch('http://localhost:8080/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    conversationId: conversationId,
                    message: newMessage 
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (broadcastResponse.ok) {
                console.log('[API] Broadcast request successful.');
            } else {
                console.error(`[API] Broadcast request failed with status: ${broadcastResponse.status}`);
            }

        } catch (broadcastError) {
            // If the broadcast fails, log it but don't fail the whole request
            console.error('[API] Failed to broadcast message to WebSocket server:', broadcastError.name === 'AbortError' ? 'Timeout' : broadcastError);
        }
        
        // No log here, as it would be too noisy. Chat actions are not typically logged for audit.

        // --- Send Push Notifications ---
        try {
            console.log('[FCM] Finding participants to notify...');
            const participants = await prisma.conversationParticipant.findMany({
                where: {
                    conversationId: conversationId,
                    userId: { not: user.id }, // Exclude the sender
                },
                include: {
                    user: {
                        select: { fcmToken: true, name: true }
                    }
                }
            });
            console.log(`[FCM] Found ${participants.length} potential participants.`);

            const tokens = participants
                .map(p => p.user.fcmToken)
                .filter(token => token != null && token.length > 0);
            
            console.log(`[FCM] Extracted ${tokens.length} valid FCM tokens.`);

            if (tokens.length > 0) {
                const admin = (await import('@/app/lib/firebaseAdmin')).default;
                const payload = {
                    notification: {
                        title: newMessage.sender.name || 'New Message',
                        body: newMessage.content || 'Sent an attachment',
                    },
                    data: {
                        action: 'sync_chat',
                        conversationId: conversationId,
                    },
                };

                const multicastMessage = {
                    tokens: tokens,
                    notification: payload.notification,
                    data: payload.data,
                };

                console.log(`[FCM] Sending notification to tokens:`, tokens);
                console.log(`[FCM] Payload:`, JSON.stringify(multicastMessage, null, 2));

                const fcmResponse = await admin.messaging().sendEachForMulticast(multicastMessage);
                console.log('[FCM] Response from Firebase:', JSON.stringify(fcmResponse, null, 2));

                if (fcmResponse.failureCount > 0) {
                    console.error('[FCM] Some notifications failed to send.');
                }
            }
        } catch (fcmError) {
            console.error('[FCM] CRITICAL: Failed to send push notification:', fcmError);
        }
        // --- End Send Push Notifications ---

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
