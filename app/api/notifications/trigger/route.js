import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/app/lib/notificationService';
import { getStartOfDay, getEndOfDay } from '@/app/lib/dateUtils';

// A simple secret to protect the endpoint.
const TRIGGER_SECRET = process.env.NOTIFICATION_TRIGGER_SECRET;

// =================================================================
// NOTIFICATION LOGIC FUNCTIONS
// =================================================================

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

    if (tasksDueToday.length === 0) return [];

    const userNotifications = tasksDueToday.reduce((acc, task) => {
        const user = task.flock?.farm?.owner;
        if (user && user.fcmToken) {
            if (!acc[user.id]) {
                acc[user.id] = { user, tasks: [] };
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
                    acc[user.id] = { user, items: [] };
                }
                acc[user.id].items.push({
                    name: item.name,
                });
            }
        }
        return acc;
    }, {});

    return Object.values(lowStockByUser);
}

async function getMissingWeightNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeFlocks = await prisma.flock.findMany({
        where: { status: 'active' },
        include: {
            farm: { include: { owner: true } },
            growthRecords: {
                orderBy: { date: 'desc' },
                take: 1,
            },
        },
    });

    const notificationsByUser = activeFlocks.reduce((acc, flock) => {
        const latestRecord = flock.growthRecords[0];
        if (!latestRecord || latestRecord.date < thirtyDaysAgo) {
            const user = flock.farm?.owner;
            if (user && user.fcmToken) {
                if (!acc[user.id]) {
                    acc[user.id] = { user, flocks: [] };
                }
                acc[user.id].flocks.push(flock);
            }
        }
        return acc;
    }, {});

    return Object.values(notificationsByUser);
}

async function getMortalitySpikeNotifications() {
    const todayStart = getStartOfDay(new Date());

    const activeFlocks = await prisma.flock.findMany({
        where: { status: 'active' },
        include: { farm: { include: { owner: true } } },
    });

    if (activeFlocks.length === 0) return [];

    const todaysMortalities = await prisma.mortalityRecord.findMany({
        where: {
            date: { gte: todayStart },
            flockId: { in: activeFlocks.map(f => f.id) },
        },
    });

    const mortalitiesByFlock = todaysMortalities.reduce((acc, m) => {
        acc[m.flockId] = (acc[m.flockId] || 0) + m.quantity;
        return acc;
    }, {});

    const notifications = [];
    for (const flock of activeFlocks) {
        const todaysFlockMortality = mortalitiesByFlock[flock.id] || 0;
        if (todaysFlockMortality > 0) {
            const threshold = (flock.quantity + todaysFlockMortality) * 0.05;
            if (todaysFlockMortality > threshold && threshold > 1) {
                notifications.push({
                    user: flock.farm.owner,
                    flockName: flock.name,
                });
            }
        }
    }

    const userNotifications = notifications.reduce((acc, notif) => {
        const user = notif.user;
        if (user && user.fcmToken) {
            if (!acc[user.id]) {
                acc[user.id] = { user, flocks: [] };
            }
            acc[user.id].flocks.push({ name: notif.flockName });
        }
        return acc;
    }, {});

    return Object.values(userNotifications);
}

async function getMissingFeedNotifications(checkType) {
    const todayStart = getStartOfDay(new Date());
    const activeFlocks = await prisma.flock.findMany({
        where: { status: 'active' },
        include: { farm: { include: { owner: true } } },
    });

    if (activeFlocks.length === 0) return [];

    const todaysConsumptions = await prisma.feedConsumption.findMany({
        where: { date: { gte: todayStart }, flockId: { in: activeFlocks.map(f => f.id) } },
    });
    
    // For 'midday' check, we care about morning feedings. The client logic for this is complex,
    // so we'll simplify on the server: if it's before 2 PM and nothing is logged, we remind.
    const isMorningCheck = checkType === 'midday' && new Date().getHours() < 14;

    const flocksNotFed = activeFlocks.filter(flock => {
        const hasBeenFed = todaysConsumptions.some(c => c.flockId === flock.id);
        // If it's a morning check, we only care if they haven't been fed.
        // If it's a final check, we also only care if they haven't been fed.
        return !hasBeenFed;
    });

    if (flocksNotFed.length === 0) return [];

    const userNotifications = flocksNotFed.reduce((acc, flock) => {
        const user = flock.farm?.owner;
        if (user && user.fcmToken) {
            if (!acc[user.id]) {
                acc[user.id] = { user, flocks: [] };
            }
            acc[user.id].flocks.push(flock);
        }
        return acc;
    }, {});

    return Object.values(userNotifications);
}

// =================================================================
// API ROUTE HANDLER
// =================================================================

export async function POST(request) {
    const authHeader = request.headers.get('authorization');
    if (!TRIGGER_SECRET || authHeader !== `Bearer ${TRIGGER_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { checkType } = await request.json();
        let triggeredCount = 0;

        switch (checkType) {
            case 'morning': {
                const healthTaskNotifications = await getHealthTaskNotifications();
                for (const { user, tasks } of healthTaskNotifications) {
                    const title = `📋 ${tasks.length} Health Task${tasks.length > 1 ? 's' : ''} Due Today`;
                    const body = `Tasks for flocks: ${[...new Set(tasks.map(t => t.flock.name))].join(', ')}.`;
                    await sendPushNotification(user.fcmToken, title, body, { screen: '/health' });
                }
                triggeredCount += healthTaskNotifications.length;
                // NOTE: Add Feed Change and Benchmark checks here later
                break;
            }

            case 'midday': {
                const missingFeed = await getMissingFeedNotifications('midday');
                for (const { user, flocks } of missingFeed) {
                    const title = `ℹ️ Feed Reminder`;
                    const body = `${flocks.length} flock${flocks.length > 1 ? 's' : ''} have no morning feeding recorded.`;
                    await sendPushNotification(user.fcmToken, title, body, { screen: '/production/add-feed' });
                }
                triggeredCount += missingFeed.length;
                break;
            }

            case 'evening': {
                const lowStockNotifications = await getLowStockNotifications();
                for (const { user, items } of lowStockNotifications) {
                    const title = `⚠️ ${items.length} Item${items.length > 1 ? 's' : ''} Running Low`;
                    const body = `${items.map(i => i.name).join(', ')} are below their thresholds.`;
                    await sendPushNotification(user.fcmToken, title, body, { screen: '/inventory' });
                }
                triggeredCount += lowStockNotifications.length;

                const missingWeight = await getMissingWeightNotifications();
                for (const { user, flocks } of missingWeight) {
                    const title = `ℹ️ Weight Records Missing`;
                    const body = `No weight recorded for ${flocks.map(f => f.name).join(', ')} in over 30 days.`;
                    await sendPushNotification(user.fcmToken, title, body, { screen: '/health/record-farm-weight' });
                }
                triggeredCount += missingWeight.length;
                
                const mortalitySpikes = await getMortalitySpikeNotifications();
                for (const { user, flocks } of mortalitySpikes) {
                    const title = `🚨 High Mortality Alert`;
                    const body = `Unusual mortality detected in ${flocks.map(f => f.name).join(', ')}.`;
                    await sendPushNotification(user.fcmToken, title, body, { screen: '/production' });
                }
                triggeredCount += mortalitySpikes.length;

                // NOTE: Add Egg Anomaly checks here later
                break;
            }
            
            case 'final_feed': {
                const missingFeed = await getMissingFeedNotifications('final_feed');
                for (const { user, flocks } of missingFeed) {
                    const title = `⚠️ Final Feed Reminder`;
                    const body = `No feeding was recorded today for ${flocks.map(f => f.name).join(', ')}.`;
                    await sendPushNotification(user.fcmToken, title, body, { screen: '/production/add-feed' });
                }
                triggeredCount += missingFeed.length;
                break;
            }

            default: {
                console.warn(`Unknown or unsupported checkType: ${checkType}`);
                break;
            }
        }

        return NextResponse.json({ success: true, triggeredNotifications: triggeredCount, checkType });

    } catch (error) {
        console.error('[NOTIFICATION TRIGGER] Error:', error);
        return NextResponse.json({ error: 'Failed to trigger notifications' }, { status: 500 });
    }
}
