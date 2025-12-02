const { PrismaClient, FlockType, UserType, OwnerApprovalStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const rawHealthScheduleTemplates = [
  // ============== BROILER SCHEDULE ==============
  { day: 1, durationInDays: 1, taskName: 'Glucose C', taskType: 'Medication', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 2, durationInDays: 4, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 6, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 7, durationInDays: 1, taskName: '1st Gumboro - Intermediate', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 8, durationInDays: 2, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 10, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 13, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 14, durationInDays: 1, taskName: '1st Newcastle - HB1', taskType: 'Vaccination', method: 'Eye Drop', birdType: 'BROILER' },
  { day: 15, durationInDays: 6, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 21, durationInDays: 1, taskName: '2nd Gumboro - Intermediate Plus', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 22, durationInDays: 3, taskName: 'Vitamins + Antibiotics', taskType: 'Medication', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 25, durationInDays: 3, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 28, durationInDays: 1, taskName: '2nd Newcastle - Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 29, durationInDays: 6, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 35, durationInDays: 4, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'BROILER' },
  { day: 39, durationInDays: 4, taskName: 'Plain Water (Finishing)', taskType: 'Other', method: 'Drinking Water', birdType: 'BROILER' },

  // ============== LAYER SCHEDULE (Programme II) ==============
  { day: 1, durationInDays: 1, taskName: 'Glucose C', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 2, durationInDays: 4, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 6, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 7, durationInDays: 1, taskName: '1st Gumboro - Intermediate', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 8, durationInDays: 2, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 10, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 13, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 14, durationInDays: 1, taskName: '1st Newcastle - HB1', taskType: 'Vaccination', method: 'Eye Drop', birdType: 'LAYER' },
  { day: 15, durationInDays: 2, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 17, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 20, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 21, durationInDays: 1, taskName: '2nd Gumboro-Intermediate Plus', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 22, durationInDays: 2, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 24, durationInDays: 3, taskName: 'Coccidiostat+Vitamins+Antibiotics', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 27, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 28, durationInDays: 1, taskName: '2nd Newcastle -Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 29, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 30, durationInDays: 3, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 33, durationInDays: 2, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 35, durationInDays: 1, taskName: '2nd Gumboro-Intermediate Plus', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 36, durationInDays: 3, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 39, durationInDays: 3, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 42, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 43, durationInDays: 2, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 45, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 48, durationInDays: 4, taskName: 'Coccidiostat+Vitamins+Antibiotics', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 52, durationInDays: 3, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 55, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 56, durationInDays: 1, taskName: '1st Fowlpox', taskType: 'Vaccination', method: 'Wing Web Stab', birdType: 'LAYER' },
  { day: 57, durationInDays: 2, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 59, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 62, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 63, durationInDays: 1, taskName: 'Deworming', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 64, durationInDays: 2, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 66, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 69, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 70, durationInDays: 1, taskName: '3rd Newcastle -Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 71, durationInDays: 2, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 73, durationInDays: 3, taskName: 'Coccidiostat Vitamins Antibiotics', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 76, durationInDays: 4, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 80, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 83, durationInDays: 1, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 84, durationInDays: 1, taskName: '2nd Fowlpox', taskType: 'Vaccination', method: 'Wing Web Stab', birdType: 'LAYER' },
  { day: 85, durationInDays: 2, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 87, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 90, durationInDays: 1, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 91, durationInDays: 1, taskName: 'Debeaking', taskType: 'Other', method: 'Procedure', birdType: 'LAYER' },
  { day: 92, durationInDays: 2, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 94, durationInDays: 3, taskName: 'Vitamins +Antibiotics', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 97, durationInDays: 5, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 102, durationInDays: 3, taskName: 'Coccidiostat', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 105, durationInDays: 4, taskName: 'Plain Water', taskType: 'Other', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 109, durationInDays: 3, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'LAYER' },
  { day: 112, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  
  // Recurring Newcastle vaccinations for Layers (every 2 months for 2 years)
  { day: 172, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 232, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 292, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 352, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 412, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 472, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 532, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 592, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 652, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },
  { day: 712, durationInDays: 1, taskName: 'Inactivated Newcastle-Newcarvac', taskType: 'Vaccination', method: 'Injection', birdType: 'LAYER' },

  // ============== BREEDER SCHEDULE ==============
  // Note: This is a simplified, generic schedule. Breeder schedules can be very complex.
  // Chick phase (Weeks 1-8)
  { day: 1, durationInDays: 1, taskName: 'Glucose C & Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 2, durationInDays: 4, taskName: 'Vitamins', taskType: 'Medication', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 7, durationInDays: 1, taskName: '1st Gumboro - Intermediate', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 14, durationInDays: 1, taskName: '1st Newcastle - HB1', taskType: 'Vaccination', method: 'Eye Drop', birdType: 'BREEDER' },
  { day: 21, durationInDays: 1, taskName: '2nd Gumboro - Intermediate Plus', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 28, durationInDays: 1, taskName: '2nd Newcastle - Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 42, durationInDays: 1, taskName: '1st Fowl Pox', taskType: 'Vaccination', method: 'Wing Web Stab', birdType: 'BREEDER' },
  { day: 56, durationInDays: 1, taskName: '3rd Gumboro - Oil Based (Killed)', taskType: 'Vaccination', method: 'Injection', birdType: 'BREEDER' },
  
  // Grower phase (Weeks 9-20)
  { day: 63, durationInDays: 1, taskName: 'Deworming', taskType: 'Medication', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 70, durationInDays: 1, taskName: '3rd Newcastle - Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 84, durationInDays: 1, taskName: '2nd Fowl Pox', taskType: 'Vaccination', method: 'Wing Web Stab', birdType: 'BREEDER' },
  { day: 98, durationInDays: 1, taskName: 'Fowl Typhoid - Killed', taskType: 'Vaccination', method: 'Injection', birdType: 'BREEDER' },
  { day: 112, durationInDays: 1, taskName: 'Inactivated Newcastle + IB + EDS (Nobilis RT-IB-EDS)', taskType: 'Vaccination', method: 'Injection', birdType: 'BREEDER' },
  { day: 126, durationInDays: 1, taskName: 'Deworming', taskType: 'Medication', method: 'Drinking Water', birdType: 'BREEDER' },

  // Laying phase (Weeks 21+) - vaccinations repeated every 2-3 months
  { day: 140, durationInDays: 1, taskName: '4th Newcastle - Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 200, durationInDays: 1, taskName: '5th Newcastle - Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BREEDER' },
  { day: 260, durationInDays: 1, taskName: '6th Newcastle - Lasota', taskType: 'Vaccination', method: 'Drinking Water', birdType: 'BREEDER' },
  // ... and so on for the life of the breeder flock.
];

function consolidateTemplates(templates) {
  if (!templates || templates.length === 0) {
    return [];
  }

  // Sort by birdType and then by day to ensure proper processing
  const sorted = templates.sort((a, b) => {
    if (a.birdType < b.birdType) return -1;
    if (a.birdType > b.birdType) return 1;
    return a.day - b.day;
  });

  const consolidated = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    const currentEndDate = current.day + current.durationInDays;

    // Check if the next task is the same and immediately follows the current one
    if (
      next.birdType === current.birdType &&
      next.taskName === current.taskName &&
      next.taskType === current.taskType &&
      next.method === current.method &&
      next.day === currentEndDate
    ) {
      // Merge the next task into the current one by extending the duration
      current.durationInDays += next.durationInDays;
    } else {
      // Push the completed current task and start a new one
      consolidated.push(current);
      current = { ...next };
    }
  }
  // Add the last processed task
  consolidated.push(current);

  return consolidated;
}

const healthScheduleTemplates = consolidateTemplates(rawHealthScheduleTemplates);

const taskTemplates = [
  // Broilers
  { birdType: FlockType.BROILER, ageStartDays: 0, ageEndDays: 7, taskName: 'Feed Broilers (Starter)', taskDescription: 'Provide starter feed.', timesPerDay: 6 },
  { birdType: FlockType.BROILER, ageStartDays: 8, ageEndDays: 21, taskName: 'Feed Broilers (Grower)', taskDescription: 'Provide grower feed.', timesPerDay: 4 },
  { birdType: FlockType.BROILER, ageStartDays: 22, ageEndDays: 42, taskName: 'Feed Broilers (Finisher)', taskDescription: 'Provide finisher feed.', timesPerDay: 3 },
  { birdType: FlockType.BROILER, ageStartDays: 43, ageEndDays: 1000, taskName: 'Feed Broilers (Post-finisher)', taskDescription: 'Provide post-finisher feed.', timesPerDay: 2 },

  // Layers
  { birdType: FlockType.LAYER, ageStartDays: 0, ageEndDays: 42, taskName: 'Feed Layers (Starter)', taskDescription: 'Provide starter mash.', timesPerDay: 3 },
  { birdType: FlockType.LAYER, ageStartDays: 43, ageEndDays: 126, taskName: 'Feed Layers (Grower)', taskDescription: 'Provide grower mash.', timesPerDay: 2 },
  { birdType: FlockType.LAYER, ageStartDays: 127, ageEndDays: 1000, taskName: 'Feed Layers (Layer Mash)', taskDescription: 'Provide layer mash.', timesPerDay: 2 },
  { birdType: FlockType.LAYER, ageStartDays: 127, ageEndDays: 1000, taskName: 'Collect Eggs', taskDescription: 'Collect eggs from the nests.', timesPerDay: 2 },

  // Breeders
  { birdType: FlockType.BREEDER, ageStartDays: 0, ageEndDays: 56, taskName: 'Feed Breeders (Chick Starter)', taskDescription: 'Provide chick starter mash.', timesPerDay: 4 },
  { birdType: FlockType.BREEDER, ageStartDays: 57, ageEndDays: 140, taskName: 'Feed Breeders (Grower)', taskDescription: 'Provide grower mash.', timesPerDay: 2 },
  { birdType: FlockType.BREEDER, ageStartDays: 141, ageEndDays: 1000, taskName: 'Feed Breeders (Breeder Mash)', taskDescription: 'Provide breeder layer mash.', timesPerDay: 2 },
  { birdType: FlockType.BREEDER, ageStartDays: 141, ageEndDays: 1000, taskName: 'Collect Hatching Eggs', taskDescription: 'Collect fertile eggs for incubation.', timesPerDay: 3 },
];

async function seedUsers() {
  console.log('Seeding users...');
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    { email: 'admin@example.com', name: 'Admin User', userType: UserType.ADMIN, ownerApprovalStatus: OwnerApprovalStatus.APPROVED },
    { email: 'worker@example.com', name: 'Farmer User', userType: UserType.FARMER, ownerApprovalStatus: OwnerApprovalStatus.APPROVED },
    { email: 'vet@example.com', name: 'Vet User', userType: UserType.VET, ownerApprovalStatus: OwnerApprovalStatus.APPROVED }
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash: passwordHash,
          userType: user.userType,
          ownerApprovalStatus: user.ownerApprovalStatus,
          emailVerified: new Date(),
        },
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }
  console.log('Users seeded.');
}

async function seedTaskTemplates() {
  console.log('Seeding task templates...');
  for (const template of taskTemplates) {
    await prisma.taskTemplate.upsert({
      where: { birdType_ageStartDays_ageEndDays_taskName: { birdType: template.birdType, ageStartDays: template.ageStartDays, ageEndDays: template.ageEndDays, taskName: template.taskName } },
      update: {},
      create: template,
    });
  }
  console.log('Task templates seeded.');
}

async function seedHealthTemplates() {
  console.log('Seeding health schedule templates...');
  await prisma.healthScheduleTemplate.deleteMany({});
  console.log('Cleared old health schedule templates.');

  for (const template of healthScheduleTemplates) {
    const birdType = FlockType[template.birdType];
    if (!birdType) {
      console.warn(`Skipping template with invalid birdType: ${template.birdType}`);
      continue;
    }

    await prisma.healthScheduleTemplate.create({
      data: {
        birdType,
        day: template.day,
        durationInDays: template.durationInDays,
        taskName: template.taskName,
        taskType: template.taskType,
        method: template.method,
      },
    });
  }
  console.log('Health schedule templates seeded.');
}

async function seedBreeds() {
  console.log('Seeding breeds...');
  const breeds = [
    // Layers
    { name: 'Isa Brown', type: 'LAYER' },
    { name: 'White Leghorn', type: 'LAYER' },
    { name: 'Lohmann Brown', type: 'LAYER' },
    { name: 'Generic Layer', type: 'LAYER' },
    // Broilers
    { name: 'Ross 308', type: 'BROILER' },
    { name: 'Cobb 500', type: 'BROILER' },
    { name: 'Generic Broiler', type: 'BROILER' },
    // Breeders
    { name: 'Generic Breeder', type: 'BREEDER' },
  ];

  for (const breed of breeds) {
    await prisma.breed.upsert({
      where: { name: breed.name },
      update: {},
      create: breed,
    });
  }
  console.log('Breeds seeded.');
}

async function seedBenchmarks() {
  console.log('Seeding benchmarks...');
  const isaBrown = await prisma.breed.findUnique({ where: { name: 'Isa Brown' } });
  const cobb500 = await prisma.breed.findUnique({ where: { name: 'Cobb 500' } });
  const genericLayer = await prisma.breed.findUnique({ where: { name: 'Generic Layer' } });
  const genericBroiler = await prisma.breed.findUnique({ where: { name: 'Generic Broiler' } });
  const genericBreeder = await prisma.breed.findUnique({ where: { name: 'Generic Breeder' } });
  const whiteLeghorn = await prisma.breed.findUnique({ where: { name: 'White Leghorn' } });
  const lohmannBrown = await prisma.breed.findUnique({ where: { name: 'Lohmann Brown' } });
  const ross308 = await prisma.breed.findUnique({ where: { name: 'Ross 308' } });

  // ============================================
  // ISA BROWN (Layer) - Based on official ISA Brown performance guide
  // ============================================
  if (isaBrown) {
    // Rearing period (weeks 1-18) with accurate growth data
    const isaBrownRearing = [
      { week: 1, feedIntake: 11, bodyWeight: 65 },
      { week: 2, feedIntake: 17, bodyWeight: 110 },
      { week: 3, feedIntake: 25, bodyWeight: 195 },
      { week: 4, feedIntake: 32, bodyWeight: 285 },
      { week: 5, feedIntake: 37, bodyWeight: 380 },
      { week: 6, feedIntake: 42, bodyWeight: 470 },
      { week: 7, feedIntake: 46, bodyWeight: 560 },
      { week: 8, feedIntake: 50, bodyWeight: 650 },
      { week: 9, feedIntake: 54, bodyWeight: 740 },
      { week: 10, feedIntake: 58, bodyWeight: 830 },
      { week: 11, feedIntake: 61, bodyWeight: 920 },
      { week: 12, feedIntake: 64, bodyWeight: 1010 },
      { week: 13, feedIntake: 67, bodyWeight: 1095 },
      { week: 14, feedIntake: 70, bodyWeight: 1180 },
      { week: 15, feedIntake: 73, bodyWeight: 1265 },
      { week: 16, feedIntake: 76, bodyWeight: 1350 },
      { week: 17, feedIntake: 80, bodyWeight: 1430 },
      { week: 18, feedIntake: 84, bodyWeight: 1500 },
    ];

    for (const data of isaBrownRearing) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: isaBrown.id, week: data.week } },
        update: {},
        create: {
          breedId: isaBrown.id,
          week: data.week,
          expectedFeedIntake: data.feedIntake,
          expectedBodyWeight: data.bodyWeight,
          expectedEggProductionRate: 0, // No egg production during rearing
        },
      });
    }

    // Laying period (weeks 19-90) - ISA Brown can produce up to 500 eggs
    for (let week = 19; week <= 90; week++) {
      let feedIntake, bodyWeight, eggProduction;

      // Feed intake stabilizes at 110-115g/day during lay
      if (week >= 19 && week <= 22) {
        feedIntake = 84 + (week - 18) * 7; // Ramp up: 91, 98, 105, 112
      } else {
        feedIntake = 112; // Peak feed intake
      }

      // Body weight increases gradually during lay
      if (week <= 30) {
        bodyWeight = 1500 + (week - 18) * 35; // Reaches ~1900g by week 30
      } else {
        bodyWeight = 1920 + (week - 30) * 8; // Slow increase, peaks ~2400g
      }

      // Egg production curve - ISA Browns reach 96% peak production
      if (week < 20) {
        eggProduction = 0;
      } else if (week === 20) {
        eggProduction = 0.50; // 50% at point of lay
      } else if (week >= 21 && week <= 25) {
        // Rapid increase to peak
        eggProduction = 0.50 + (week - 20) * 0.092; // Reaches 96% by week 25
      } else if (week > 25 && week <= 45) {
        eggProduction = 0.96; // Sustained peak production
      } else if (week > 45 && week <= 60) {
        // Gradual decline
        eggProduction = 0.96 - (week - 45) * 0.005; // Down to 88.5% by week 60
      } else {
        // Continued decline
        eggProduction = Math.max(0.70, 0.885 - (week - 60) * 0.006); // Minimum 70%
      }

      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: isaBrown.id, week } },
        update: {},
        create: {
          breedId: isaBrown.id,
          week: week,
          expectedFeedIntake: feedIntake,
          expectedBodyWeight: bodyWeight,
          expectedEggProductionRate: eggProduction,
        },
      });
    }
  }

  // ============================================
  // WHITE LEGHORN (Layer) - Lighter, higher egg production
  // ============================================
  if (whiteLeghorn) {
    for (let week = 1; week <= 90; week++) {
      let feedIntake, bodyWeight, eggProduction;

      // Feed intake - lighter birds eat less
      if (week <= 18) {
        feedIntake = 10 + week * 4; // Gradual increase to ~82g by week 18
      } else if (week > 18 && week <= 22) {
        feedIntake = 82 + (week - 18) * 5; // Ramp up to ~102g
      } else {
        feedIntake = 102; // Lower than ISA Brown (lighter bird)
      }

      // Body weight - White Leghorns are lighter
      if (week <= 18) {
        bodyWeight = 55 + week * 68; // Reaches ~1280g by week 18
      } else if (week <= 30) {
        bodyWeight = 1280 + (week - 18) * 30; // Reaches ~1640g by week 30
      } else {
        bodyWeight = 1640 + (week - 30) * 6; // Peaks at ~2000g
      }

      // Egg production - White Leghorns excel at egg numbers
      if (week < 21) {
        eggProduction = 0;
      } else if (week === 21) {
        eggProduction = 0.55; // 55% at point of lay
      } else if (week >= 22 && week <= 26) {
        eggProduction = 0.55 + (week - 21) * 0.082; // Reaches 96% by week 26
      } else if (week > 26 && week <= 50) {
        eggProduction = 0.96; // Extended peak production
      } else if (week > 50 && week <= 65) {
        eggProduction = 0.96 - (week - 50) * 0.004; // Down to 90% by week 65
      } else {
        eggProduction = Math.max(0.75, 0.90 - (week - 65) * 0.006); // Minimum 75%
      }

      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: whiteLeghorn.id, week } },
        update: {},
        create: {
          breedId: whiteLeghorn.id,
          week: week,
          expectedFeedIntake: feedIntake,
          expectedBodyWeight: bodyWeight,
          expectedEggProductionRate: eggProduction,
        },
      });
    }
  }

  // ============================================
  // LOHMANN BROWN (Layer) - Similar to ISA Brown
  // ============================================
  if (lohmannBrown) {
    for (let week = 1; week <= 90; week++) {
      let feedIntake, bodyWeight, eggProduction;

      // Feed intake - similar to ISA Brown
      if (week <= 18) {
        feedIntake = 11 + week * 4.3; // Reaches ~88g by week 18
      } else if (week > 18 && week <= 23) {
        feedIntake = 88 + (week - 18) * 5.8; // Ramps to ~117g by week 23
      } else {
        feedIntake = 117; // Slightly higher than ISA Brown
      }

      // Body weight - similar to ISA Brown
      if (week <= 18) {
        bodyWeight = 65 + week * 82; // Reaches ~1540g by week 18
      } else if (week <= 30) {
        bodyWeight = 1540 + (week - 18) * 33; // Reaches ~1936g by week 30
      } else {
        bodyWeight = 1936 + (week - 30) * 7; // Peaks ~2356g
      }

      // Egg production - Lohmann Browns have excellent persistency
      if (week < 20) {
        eggProduction = 0;
      } else if (week === 20) {
        eggProduction = 0.50;
      } else if (week >= 21 && week <= 25) {
        eggProduction = 0.50 + (week - 20) * 0.088; // Reaches 94% by week 25
      } else if (week > 25 && week <= 42) {
        eggProduction = 0.94; // Sustained peak
      } else if (week > 42 && week <= 60) {
        eggProduction = 0.94 - (week - 42) * 0.005; // Down to 85% by week 60
      } else {
        eggProduction = Math.max(0.70, 0.85 - (week - 60) * 0.005); // Minimum 70%
      }

      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: lohmannBrown.id, week } },
        update: {},
        create: {
          breedId: lohmannBrown.id,
          week: week,
          expectedFeedIntake: feedIntake,
          expectedBodyWeight: bodyWeight,
          expectedEggProductionRate: eggProduction,
        },
      });
    }
  }

  // ============================================
  // GENERIC LAYER - Average of commercial layers
  // ============================================
  if (genericLayer) {
    for (let week = 1; week <= 90; week++) {
      let feedIntake, bodyWeight, eggProduction;

      if (week <= 18) {
        feedIntake = 10 + week * 4.1;
        bodyWeight = 60 + week * 75;
      } else if (week > 18 && week <= 22) {
        feedIntake = 84 + (week - 18) * 6;
        bodyWeight = 1410 + (week - 18) * 32;
      } else {
        feedIntake = 108;
        bodyWeight = 1538 + (week - 22) * 10;
      }

      if (week < 21) {
        eggProduction = 0;
      } else if (week >= 21 && week <= 26) {
        eggProduction = (week - 20) * 0.16; // Reaches 92% by week 26
      } else if (week > 26 && week <= 48) {
        eggProduction = 0.92;
      } else {
        eggProduction = Math.max(0.68, 0.92 - (week - 48) * 0.006);
      }

      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: genericLayer.id, week } },
        update: {},
        create: {
          breedId: genericLayer.id,
          week: week,
          expectedFeedIntake: feedIntake,
          expectedBodyWeight: bodyWeight,
          expectedEggProductionRate: eggProduction,
        },
      });
    }
  }

  // ============================================
  // COBB 500 (Broiler) - Based on official Cobb 500 standards
  // ============================================
  if (cobb500) {
    const cobb500Data = [
      // Week, Daily Feed Intake (g), Body Weight (g)
      { week: 1, feedIntake: 20, bodyWeight: 185 },   // Day 7
      { week: 2, feedIntake: 40, bodyWeight: 465 },   // Day 14
      { week: 3, feedIntake: 65, bodyWeight: 865 },   // Day 21
      { week: 4, feedIntake: 90, bodyWeight: 1353 },  // Day 28
      { week: 5, feedIntake: 115, bodyWeight: 1895 }, // Day 35
      { week: 6, feedIntake: 135, bodyWeight: 2482 }, // Day 42 (typical market weight)
      { week: 7, feedIntake: 152, bodyWeight: 3043 }, // Day 49
      { week: 8, feedIntake: 165, bodyWeight: 3596 }, // Day 56
    ];

    for (const data of cobb500Data) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: cobb500.id, week: data.week } },
        update: {},
        create: {
          breedId: cobb500.id,
          week: data.week,
          expectedFeedIntake: data.feedIntake,
          expectedBodyWeight: data.bodyWeight,
          expectedEggProductionRate: 0, // Broilers don't lay eggs
        },
      });
    }
  }

  // ============================================
  // ROSS 308 (Broiler) - Based on Ross 308 performance objectives
  // ============================================
  if (ross308) {
    const ross308Data = [
      // Week, Daily Feed Intake (g), Body Weight (g)
      { week: 1, feedIntake: 17, bodyWeight: 160 },   // Day 7
      { week: 2, feedIntake: 38, bodyWeight: 450 },   // Day 14
      { week: 3, feedIntake: 63, bodyWeight: 840 },   // Day 21
      { week: 4, feedIntake: 88, bodyWeight: 1320 },  // Day 28
      { week: 5, feedIntake: 112, bodyWeight: 1850 }, // Day 35
      { week: 6, feedIntake: 132, bodyWeight: 2430 }, // Day 42
      { week: 7, feedIntake: 149, bodyWeight: 2980 }, // Day 49
      { week: 8, feedIntake: 163, bodyWeight: 3520 }, // Day 56
    ];

    for (const data of ross308Data) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: ross308.id, week: data.week } },
        update: {},
        create: {
          breedId: ross308.id,
          week: data.week,
          expectedFeedIntake: data.feedIntake,
          expectedBodyWeight: data.bodyWeight,
          expectedEggProductionRate: 0,
        },
      });
    }
  }

  // ============================================
  // GENERIC BROILER - Average performance
  // ============================================
  if (genericBroiler) {
    const genericBroilerData = [
      { week: 1, feedIntake: 18, bodyWeight: 170 },
      { week: 2, feedIntake: 39, bodyWeight: 455 },
      { week: 3, feedIntake: 64, bodyWeight: 850 },
      { week: 4, feedIntake: 89, bodyWeight: 1335 },
      { week: 5, feedIntake: 113, bodyWeight: 1870 },
      { week: 6, feedIntake: 133, bodyWeight: 2450 },
      { week: 7, feedIntake: 150, bodyWeight: 3010 },
      { week: 8, feedIntake: 164, bodyWeight: 3555 },
    ];

    for (const data of genericBroilerData) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: genericBroiler.id, week: data.week } },
        update: {},
        create: {
          breedId: genericBroiler.id,
          week: data.week,
          expectedFeedIntake: data.feedIntake,
          expectedBodyWeight: data.bodyWeight,
          expectedEggProductionRate: 0,
        },
      });
    }
  }

  // ============================================
  // GENERIC BREEDER - Breeder performance
  // ============================================
  if (genericBreeder) {
    for (let week = 1; week <= 100; week++) {
      let feedIntake, bodyWeight, eggProduction;

      // Breeder rearing phase (0-20 weeks) - controlled growth
      if (week <= 4) {
        feedIntake = 15 + week * 5; // 20-35g
        bodyWeight = 80 + week * 70; // 150-360g
      } else if (week > 4 && week <= 20) {
        feedIntake = 35 + (week - 4) * 4; // 39-99g
        bodyWeight = 360 + (week - 4) * 120; // 480-2280g
      }
      // Pre-lay (21-24 weeks)
      else if (week > 20 && week <= 24) {
        feedIntake = 99 + (week - 20) * 13; // 112-151g
        bodyWeight = 2280 + (week - 20) * 80; // 2360-2600g
      }
      // Laying phase (25+ weeks)
      else {
        feedIntake = 160 + (week > 40 ? (week - 40) * 0.5 : 0); // Increases slightly, max 170g
        feedIntake = Math.min(feedIntake, 170);
        bodyWeight = 2600 + (week - 24) * 15; // Continues to grow slowly
        bodyWeight = Math.min(bodyWeight, 4000); // Cap at 4kg
      }

      // Egg production for breeders
      if (week < 24) {
        eggProduction = 0; // No production before 24 weeks
      } else if (week >= 24 && week <= 30) {
        eggProduction = (week - 23) * 0.12; // Ramp up to 84% by week 30
      } else if (week > 30 && week <= 50) {
        eggProduction = 0.84; // Peak production lower than layers
      } else if (week > 50 && week <= 65) {
        eggProduction = 0.84 - (week - 50) * 0.008; // Decline to 72%
      } else {
        eggProduction = Math.max(0.60, 0.72 - (week - 65) * 0.004); // Minimum 60%
      }

      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: genericBreeder.id, week } },
        update: {},
        create: {
          breedId: genericBreeder.id,
          week: week,
          expectedFeedIntake: feedIntake,
          expectedBodyWeight: bodyWeight,
          expectedEggProductionRate: eggProduction,
        },
      });
    }
  }

  console.log('Benchmarks seeded with accurate data.');
}


async function main() {
  await seedUsers();
  await seedTaskTemplates();
  await seedHealthTemplates();
  await seedBreeds();
  await seedBenchmarks();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });