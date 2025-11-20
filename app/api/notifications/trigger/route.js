import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/app/lib/notificationService';
import { getStartOfDay, getEndOfDay } from '@/app/lib/dateUtils'; // Updated import

// A simple secret to protect the endpoint. In a real app, use a more robust auth method.
const TRIGGER_SECRET = process.env.NOTIFICATION_TRIGGER_SECRET || 'your-secret-key';

async function getHealthTaskNotifications() {
    const todayStart = getStartOfDay(new Date());
    const todayEnd = getEndOfDay(new Date());

    const tasksDueToday = await prisma.healthTask.findMany({
        where: {
            scheduledDate: {
                gte: todayStart,
                lte: todayEnd,
            },
            status: {
                not: 'COMPLETED',
            },
        },
        include: {
            flock: {
                include: {
                    farm: {
                        include: {
                            owner: true,
                        },
                    },
                },
            },
        },
    });

    if (tasksDueToday.length === 0) {
        return [];
    }

    // Group tasks by user
    const userNotifications = tasksDueToday.reduce((acc, task) => {
        const user = task.flock?.farm?.owner;
        if (user && user.fcmToken) {
            if (!acc[user.id]) {
                acc[user.id] = {
                    user,
                    tasks: [],
                };
            }
            acc[user.id].tasks.push(task);
        }
        return acc;
    }, {});

    return Object.values(userNotifications);
}

async function getLowStockNotifications() {
    const items = await prisma.inventoryItem.findMany({
        where: {
            status: 'active',
            lowStockThreshold: {
                not: null,
            },
        },
        include: {
            lots: {
                select: {
                    remainingQuantity: true,
                },
            },
            farm: {
                include: {
                    owner: true,
                },
            },
        },
    });

    const lowStockByUser = items.reduce((acc, item) => {
        const currentStock = item.lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);

        if (currentStock <= item.lowStockThreshold) {
            const user = item.farm?.owner;
            if (user && user.fcmToken) {
                if (!acc[user.id]) {
                    acc[user.id] = {
                        user,
                        items: [],
                    };
                }
                acc[user.id].items.push({
                    name: item.name,
                    currentStock,
                    unit: item.unit,
                });
            }
        }
        return acc;
    }, {});

    return Object.values(lowStockByUser);
}


export async function POST(request) {
    // Protect the endpoint
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${TRIGGER_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const healthTaskNotifications = await getHealthTaskNotifications();
        const lowStockNotifications = await getLowStockNotifications();

        for (const notification of healthTaskNotifications) {
            const { user, tasks } = notification;
            const taskCount = tasks.length;
            const title = `📋 ${taskCount} Health Task${taskCount > 1 ? 's' : ''} Due Today`;
            const body = `Tasks for flocks: ${[...new Set(tasks.map(t => t.flock.name))].join(', ')}.`;
            
            await sendPushNotification(user.fcmToken, title, body, {
                action: 'view_health_tasks',
                // Add any other data needed for navigation
            });
        }

        for (const notification of lowStockNotifications) {
            const { user, items } = notification;
            const itemCount = items.length;
            const title = `⚠️ ${itemCount} Item${itemCount > 1 ? 's' : ''} Running Low`;
            const body = `${items.map(i => i.name).join(', ')} are below their thresholds.`;

            await sendPushNotification(user.fcmToken, title, body, {
                action: 'view_inventory',
            });
        }

        const triggeredCount = healthTaskNotifications.length + lowStockNotifications.length;

        return NextResponse.json({ success: true, triggeredNotifications: triggeredCount });

    } catch (error) {
        console.error('[NOTIFICATION TRIGGER] Error:', error);
        return NextResponse.json({ error: 'Failed to trigger notifications' }, { status: 500 });
    }
}
