// app/lib/taskUtils.js
import { PrismaClient } from '@prisma/client';
import { logAction } from './logging';

const prisma = new PrismaClient();

/**
 * Finds and marks a pending task as completed if it matches the criteria.
 * @param {string} flockId - The ID of the flock the action was performed on.
 * @param {string} taskTitlePattern - A string or regex pattern to match the task title (e.g., "Feed Flock", "Record Egg Production").
 * @param {Date} completionTime - The time the action was performed.
 * @param {number} timeWindowHours - The time window in hours to check for the task's due date.
 */
export async function completeTaskIfDue(flockId, taskTitlePattern, completionTime, timeWindowHours = 3) {
  try {
    const startTime = new Date(completionTime.getTime() - timeWindowHours * 60 * 60 * 1000);
    const endTime = new Date(completionTime.getTime() + timeWindowHours * 60 * 60 * 1000);

    const tasksToComplete = await prisma.task.findMany({
      where: {
        flockId,
        status: 'PENDING',
        title: {
          contains: taskTitlePattern,
        },
        dueDate: {
          gte: startTime,
          lte: endTime,
        },
      },
    });

    if (tasksToComplete.length > 0) {
      for (const task of tasksToComplete) {
        await prisma.task.update({
          where: { id: task.id },
          data: { status: 'COMPLETED' },
        });
        await logAction('INFO', `Task "${task.title}" automatically marked as completed.`, {
          taskId: task.id,
          flockId,
          farmId: task.farmId,
        });
      }
    }
  } catch (error) {
    console.error(`Error in completeTaskIfDue: ${error.message}`);
    await logAction('ERROR', 'Failed to automatically complete task.', {
      error: error.message,
      flockId,
      taskTitlePattern,
    });
  }
}
