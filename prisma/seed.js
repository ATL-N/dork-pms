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

  // ISA Brown (Layer) - Sample Data
  if (isaBrown) {
    for (let week = 1; week <= 90; week++) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: isaBrown.id, week } },
        update: {},
        create: {
          breedId: isaBrown.id,
          week: week,
          expectedFeedIntake: 18 + 0.5 * week * 5, // g/day, simplistic growth
          expectedBodyWeight: 70 + week * 20, // g, simplistic growth
          expectedEggProductionRate: week > 18 ? Math.min(0.95, (week - 18) * 0.05) : 0, // %
        },
      });
    }
  }

  // Cobb 500 (Broiler) - Sample Data
  if (cobb500) {
    for (let week = 1; week <= 8; week++) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: cobb500.id, week } },
        update: {},
        create: {
          breedId: cobb500.id,
          week: week,
          expectedFeedIntake: 25 + week * 22, // g/day, simplistic growth
          expectedBodyWeight: 150 + week * 450, // g, simplistic growth
        },
      });
    }
  }
  
  // Generic Layer
  if (genericLayer) {
    for (let week = 1; week <= 90; week++) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: genericLayer.id, week } },
        update: {},
        create: {
          breedId: genericLayer.id,
          week: week,
          expectedFeedIntake: 20 + 0.5 * week * 5, // g/day, slightly lower than isa brown
          expectedBodyWeight: 65 + week * 19, // g, slightly lower
          expectedEggProductionRate: week > 20 ? Math.min(0.92, (week - 20) * 0.045) : 0, // starts later, slightly lower peak
        },
      });
    }
  }

  // Generic Broiler
  if (genericBroiler) {
    for (let week = 1; week <= 8; week++) {
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: genericBroiler.id, week } },
        update: {},
        create: {
          breedId: genericBroiler.id,
          week: week,
          expectedFeedIntake: 22 + week * 20, // g/day, slightly lower
          expectedBodyWeight: 140 + week * 430, // g, slightly lower
        },
      });
    }
  }

  // Generic Breeder
  if (genericBreeder) {
    for (let week = 1; week <= 100; week++) { // Breeders have a longer life
      await prisma.standardBenchmark.upsert({
        where: { breedId_week: { breedId: genericBreeder.id, week } },
        update: {},
        create: {
          breedId: genericBreeder.id,
          week: week,
          // Breeder feed intake is carefully managed to control weight
          expectedFeedIntake: 30 + week * 1.5, 
          // Body weight is higher than layers but controlled
          expectedBodyWeight: 80 + week * 25, 
          // Egg production starts later and might have a different curve
          expectedEggProductionRate: week > 24 ? Math.min(0.88, (week - 24) * 0.04) : 0,
        },
      });
    }
  }

  console.log('Benchmarks seeded.');
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