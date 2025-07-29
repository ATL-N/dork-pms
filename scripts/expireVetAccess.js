const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function expireVetAccess() {
  try {
    const now = new Date();
    const expiredRecords = await prisma.vetFarmAccess.updateMany({
      where: {
        expiresAt: { lt: now },
        status: 'ACTIVE',
      },
      data: {
        status: 'EXPIRED',
      },
    });

    console.log(`Expired ${expiredRecords.count} veterinarian access records.`);
  } catch (error) {
    console.error("Error expiring veterinarian access records:", error);
  } finally {
    await prisma.$disconnect();
  }
}

expireVetAccess();
