// scripts/check-seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const generalChat = await prisma.conversation.findUnique({
      where: { name: 'General Chat' },
    });
    if (generalChat) {
      process.exit(0); // Found, exit with success
    } else {
      process.exit(1); // Not found, exit with failure
    }
  } catch (error) {
    console.error("Error checking for seed data:", error);
    process.exit(1); // Exit with failure on error
  } finally {
    await prisma.$disconnect();
  }
}

main();
