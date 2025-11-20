import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/session';


export async function PUT(request) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { fcmToken } = await request.json();

        if (!fcmToken) {
            return NextResponse.json({ error: 'fcmToken is required' }, { status: 400 });
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                fcmToken: fcmToken,
            },
        });

        console.log(`[FCM] Successfully stored token for user: ${user.id}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[FCM] Error saving FCM token:', error);
        return NextResponse.json({ error: 'Failed to save FCM token' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ success: true });
    }

    try {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                fcmToken: null, // Clear the token
            },
        });

        console.log(`[FCM] Cleared token for user: ${user.id}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[FCM] Error clearing FCM token:', error);
        return NextResponse.json({ success: true, error: 'Failed to clear token on server' });
    }
}
