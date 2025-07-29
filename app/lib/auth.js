
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Checks if a user is a member of a specific farm and returns their role.
 * @param {string} userId - The ID of the user.
 * @param {string} farmId - The ID of the farm.
 * @returns {Promise<string|null>} The user's role on the farm, or null if not a member.
 */
export async function getUserFarmRole(userId, farmId) {
  if (!userId || !farmId) {
    return null;
  }

  const farmUser = await prisma.farmUser.findUnique({
    where: {
      farmId_userId: {
        farmId,
        userId,
      },
    },
  });

  return farmUser?.role || null;
}
