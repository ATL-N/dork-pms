// app/api/dashboard/owner/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { differenceInDays, subDays, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const userFarms = await prisma.farm.findMany({
      where: {
        OR: [
          { ownerId: currentUser.id },
          { users: { some: { userId: currentUser.id, role: 'OWNER' } } }
        ]
      },
      include: {
        flocks: {
          where: { status: 'ACTIVE' },
          include: {
            healthTasks: {
              where: {
                status: { in: ['SCHEDULED', 'MISSED'] }
              }
            },
            feedConsumption: {
              where: {
                date: {
                  gte: subDays(new Date(), 1)
                }
              }
            },
            eggProductionRecords: {
                where: {
                    date: {
                        gte: startOfDay(new Date()),
                        lte: endOfDay(new Date())
                    }
                }
            }
          }
        },
        transactions: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      }
    });

    if (userFarms.length === 0) {
      return NextResponse.json({ summary: {}, alerts: [], attentionFlocks: [] });
    }

    let totalFlocks = 0;
    let activeBirds = 0;
    let eggProductionToday = 0;
    let revenueThisMonth = 0;
    const alerts = [];
    const attentionFlocks = [];

    const today = new Date();
    const yesterday = startOfDay(subDays(today, 1));

    for (const farm of userFarms) {
      totalFlocks += farm.flocks.length;
      activeBirds += farm.flocks.reduce((sum, flock) => sum + flock.quantity, 0);
      eggProductionToday += farm.flocks.reduce((farmSum, flock) => {
          return farmSum + flock.eggProductionRecords.reduce((flockSum, record) => flockSum + record.totalEggs, 0);
      }, 0);
      revenueThisMonth += farm.transactions
        .filter(t => t.type === 'REVENUE')
        .reduce((sum, t) => sum + t.amount, 0);

      for (const flock of farm.flocks) {
        let needsAttention = false;

        // Check for missed feedings
        const wasFedYesterday = flock.feedConsumption.some(fc => new Date(fc.date) >= yesterday);
        if (!wasFedYesterday) {
          const alert = {
            id: `feed-${flock.id}`,
            type: 'warning',
            title: `Missed Feeding: ${flock.name}`,
            message: `Flock ${flock.name} was not fed yesterday.`,
            farm: farm.name,
          };
          alerts.push(alert);
          needsAttention = true;
        }

        // Check for health tasks
        for (const task of flock.healthTasks) {
          const taskDate = new Date(task.scheduledDate);
          const daysDiff = differenceInDays(taskDate, today);

          if (daysDiff < 0) { // Overdue
            alerts.push({
              id: `health-overdue-${task.id}`,
              type: 'error',
              title: `Overdue: ${task.taskName} for ${flock.name}`,
              message: `Was due on ${taskDate.toLocaleDateString()}.`,
              farm: farm.name,
            });
            needsAttention = true;
          } else if (daysDiff <= 7) { // Upcoming
            alerts.push({
              id: `health-upcoming-${task.id}`,
              type: 'info',
              title: `Upcoming: ${task.taskName} for ${flock.name}`,
              message: `Due in ${daysDiff} days on ${taskDate.toLocaleDateString()}.`,
              farm: farm.name,
            });
          }
        }
        
        if(needsAttention) {
            attentionFlocks.push({
                id: flock.id,
                name: flock.name,
                farm: farm.name,
                reason: alerts.find(a => a.id.includes(flock.id))?.title || 'Needs Review'
            });
        }
      }
    }

    const summary = {
      totalFarms: userFarms.length,
      totalFlocks,
      activeBirds,
      eggProductionToday,
      revenueThisMonth,
      alertsCount: alerts.length,
    };

    return NextResponse.json({ summary, alerts, attentionFlocks });

  } catch (error) {
    console.error('[API/DASHBOARD/OWNER]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
