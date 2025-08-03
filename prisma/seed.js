const { PrismaClient, FlockType, TransactionType, InvoiceType, InvoiceStatus, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const broilerSchedule = [
  { day: 1, taskName: "Marek's Disease", taskType: 'Vaccination', method: 'Injection' },
  { day: 5, taskName: 'Newcastle Disease (ND) B1/LaSota', taskType: 'Vaccination', method: 'Eye Drop / Drinking Water' },
  { day: 7, taskName: 'Infectious Bursal Disease (IBD) - Gumboro', taskType: 'Vaccination', method: 'Drinking Water' },
  { day: 14, taskName: 'IBD (Gumboro) Booster', taskType: 'Vaccination', method: 'Drinking Water' },
  { day: 21, taskName: 'ND B1/LaSota Booster', taskType: 'Vaccination', method: 'Drinking Water' },
  { day: 28, taskName: 'Coccidiosis Vaccine', taskType: 'Vaccination', method: 'Feed / Drinking Water' },
];

const layerSchedule = [
    { day: 1, taskName: "Marek's Disease", taskType: 'Vaccination', method: 'Injection (at hatchery)' },
    { day: 7, taskName: 'Newcastle (ND) + Infectious Bronchitis (IB)', taskType: 'Vaccination', method: 'Eye Drop' },
    { day: 14, taskName: 'Infectious Bursal Disease (IBD) - Gumboro', taskType: 'Vaccination', method: 'Drinking Water' },
    { day: 21, taskName: 'ND + IB Booster', taskType: 'Vaccination', method: 'Eye Drop' },
    { day: 28, taskName: 'IBD Booster', taskType: 'Vaccination', method: 'Drinking Water' },
    { day: 35, taskName: 'Fowl Pox', taskType: 'Vaccination', method: 'Wing Web Stab' },
    { day: 42, taskName: 'ND + IB Booster', taskType: 'Vaccination', method: 'Drinking Water' },
    { day: 56, taskName: 'Avian Encephalomyelitis (AE)', taskType: 'Vaccination', method: 'Drinking Water' },
    { day: 63, taskName: 'Infectious Coryza', taskType: 'Vaccination', method: 'Injection' },
    { day: 70, taskName: 'ND + IB Booster', taskType: 'Vaccination', method: 'Spray / Drinking Water' },
    { day: 84, taskName: 'Infectious Coryza Booster', taskType: 'Vaccination', method: 'Injection' },
    { day: 112, taskName: 'Pre-lay ND + IB + EDS', taskType: 'Vaccination', method: 'Injection' },
];

async function seedHealthTemplates() {
  console.log('Seeding health schedule templates...');
  for (const task of broilerSchedule) {
    await prisma.healthScheduleTemplate.upsert({
      where: { birdType_day_taskName: { birdType: FlockType.BROILER, day: task.day, taskName: task.taskName } },
      update: {},
      create: { ...task, birdType: FlockType.BROILER },
    });
  }
  for (const task of layerSchedule) {
    await prisma.healthScheduleTemplate.upsert({
      where: { birdType_day_taskName: { birdType: FlockType.LAYER, day: task.day, taskName: task.taskName } },
      update: {},
      create: { ...task, birdType: FlockType.LAYER },
    });
  }
  console.log('Health schedule templates seeded.');
}

async function seedFarmData() {
    console.log('Seeding farm data...');

    const ownerPassword = await bcrypt.hash('password123', 10);
    const owner = await prisma.user.upsert({
        where: { email: 'owner@example.com' },
        update: {},
        create: {
            name: 'Farm Owner',
            email: 'owner@example.com',
            passwordHash: ownerPassword,
            userType: 'FARMER',
            ownerApprovalStatus: 'APPROVED',
        }
    });

    const farm = await prisma.farm.create({
        data: {
            name: 'My Sample Farm',
            location: 'Sample Location, USA',
            ownerId: owner.id,
        }
    });

    await prisma.farmUser.upsert({
        where: { farmId_userId: { farmId: farm.id, userId: owner.id } },
        update: {},
        create: {
            farmId: farm.id,
            userId: owner.id,
            role: Role.OWNER,
        }
    });

    console.log(`Created farm "${farm.name}" for owner ${owner.email}`);

    // Seed Transactions
    await prisma.transaction.createMany({
        data: [
            { date: new Date('2025-07-01'), type: TransactionType.EXPENSE, category: 'Feed', amount: 500, vendor: 'Feed Co.', farmId: farm.id },
            { date: new Date('2025-07-05'), type: TransactionType.EXPENSE, category: 'Vet Bills', amount: 150, vendor: 'Vet Clinic', farmId: farm.id },
            { date: new Date('2025-07-10'), type: TransactionType.REVENUE, category: 'Egg Sales', amount: 800, customer: 'Local Market', farmId: farm.id },
            { date: new Date('2025-07-15'), type: TransactionType.EXPENSE, category: 'Utilities', amount: 200, description: 'Electricity Bill', farmId: farm.id },
            { date: new Date('2025-07-20'), type: TransactionType.REVENUE, category: 'Bird Sales', amount: 1200, customer: 'Restaurant', farmId: farm.id },
        ]
    });
    console.log('Seeded 5 transactions.');

    // Seed Invoices
    await prisma.invoice.createMany({
        data: [
            { invoiceNumber: 'INV-001', date: new Date('2025-07-10'), dueDate: new Date('2025-08-10'), type: InvoiceType.SALES, status: InvoiceStatus.PAID, amount: 800, customer: 'Local Market', farmId: farm.id },
            { invoiceNumber: 'INV-002', date: new Date('2025-07-20'), dueDate: new Date('2025-08-20'), type: InvoiceType.SALES, status: InvoiceStatus.PENDING, amount: 1200, customer: 'Restaurant', farmId: farm.id },
            { invoiceNumber: 'PUR-001', date: new Date('2025-07-01'), dueDate: new Date('2025-08-01'), type: InvoiceType.PURCHASE, status: InvoiceStatus.PAID, amount: 500, vendor: 'Feed Co.', farmId: farm.id },
            { invoiceNumber: 'PUR-002', date: new Date('2025-06-25'), dueDate: new Date('2025-07-25'), type: InvoiceType.PURCHASE, status: InvoiceStatus.OVERDUE, amount: 75, vendor: 'Supplies Inc.', farmId: farm.id },
        ]
    });
    console.log('Seeded 4 invoices.');

    // Seed Flocks
    const flock1 = await prisma.flock.create({
        data: {
            name: 'Broiler Batch 1',
            type: FlockType.BROILER,
            breed: 'Cobb 500',
            quantity: 100,
            initialQuantity: 100,
            startDate: new Date('2025-06-01'),
            costPerBird: 1.5,
            farmId: farm.id,
        }
    });

    const flock2 = await prisma.flock.create({
        data: {
            name: 'Layer Group A',
            type: FlockType.LAYER,
            breed: 'White Leghorn',
            quantity: 150,
            initialQuantity: 150,
            startDate: new Date('2025-03-01'),
            costPerBird: 2.0,
            farmId: farm.id,
        }
    });
    console.log('Seeded 2 flocks.');

    // Seed Inventory Items
    const feedItem = await prisma.inventoryItem.create({
        data: {
            name: 'Broiler Starter Crumble',
            category: 'Feed',
            currentStock: 500,
            unit: 'kg',
            minThreshold: 50,
            farmId: farm.id,
        }
    });

    const medItem = await prisma.inventoryItem.create({
        data: {
            name: 'Gumboro Vaccine',
            category: 'Medication',
            currentStock: 100,
            unit: 'doses',
            minThreshold: 20,
            farmId: farm.id,
        }
    });
    console.log('Seeded inventory items.');

    const broilerFeed = await prisma.feedItem.create({
        data: {
            name: 'Broiler Starter Feed',
            type: 'COMPLETE',
            quantity: 500,
            unit: 'kg',
            unitPrice: 0.75,
            purchaseDate: new Date('2025-07-01'),
            farmId: farm.id,
        }
    });
    console.log('Seeded feed item.');

    // Seed Production Records
    await prisma.eggProductionRecord.createMany({
        data: [
            { date: new Date('2025-07-20'), totalEggs: 130, brokenEggs: 5, flockId: flock2.id },
            { date: new Date('2025-07-21'), totalEggs: 135, brokenEggs: 3, flockId: flock2.id },
            { date: new Date('2025-07-22'), totalEggs: 132, brokenEggs: 4, flockId: flock2.id },
        ]
    });
    console.log('Seeded egg production records.');

    // Seed Mortality Record
    await prisma.mortalityRecord.create({
        data: {
            date: new Date('2025-07-15'),
            quantity: 2,
            cause: 'Natural causes',
            flockId: flock1.id,
        }
    });
    console.log('Seeded mortality record.');

    // Seed Bird Resale
    await prisma.birdResale.create({
        data: {
            date: new Date('2025-07-25'),
            quantity: 50,
            revenue: 350.0,
            notes: 'Sold to local butcher',
            flockId: flock1.id,
            recordedById: owner.id,
        }
    });
    console.log('Seeded bird resale.');

    // Seed Health Task (for inventory usage)
    await prisma.healthTask.create({
        data: {
            flockId: flock1.id,
            taskName: 'IBD (Gumboro) Booster',
            taskType: 'Vaccination',
            method: 'Drinking Water',
            scheduledDate: new Date('2025-06-15'),
            completedDate: new Date('2025-06-15'),
            status: 'COMPLETED',
            inventoryItemId: medItem.id,
            quantityUsed: 100,
        }
    });
    console.log('Seeded completed health task.');
    
    // Seed Feed Consumption (for inventory usage)
    await prisma.feedConsumption.create({
        data: {
            date: new Date('2025-07-24'),
            quantity: 25,
            flockId: flock1.id,
            feedItemId: broilerFeed.id,
            recordedById: owner.id,
        }
    });
    console.log('Seeded feed consumption.');
}


async function seedGeneralChat() {
  console.log('Ensuring General Chat exists...');
  await prisma.conversation.upsert({
    where: { name: 'General Chat' },
    update: {},
    create: {
      name: 'General Chat',
      isGroup: true,
    },
  });
  console.log('General Chat exists.');
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail,
      passwordHash: hashedPassword,
      userType: 'ADMIN',
    },
  });

  console.log(`Created/updated admin user with email: ${adminUser.email}`);

  await seedHealthTemplates();
  await seedFarmData();
  await seedGeneralChat();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
