import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAction(level, message, meta) {
  try {
    await prisma.log.create({
      data: {
        level,
        message,
        meta,
        userId: meta?.userId, // Optional: associate log with a user
      },
    });
  } catch (error) {
    console.error("Failed to write log:", error);
  }
}
