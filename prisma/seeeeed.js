const {
  PrismaClient,
  FlockType,
  UserType,
  ApprovalStatus,
} = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const rawHealthScheduleTemplates = [
  // ============== BROILER SCHEDULE ==============
  {
    day: 1,
    durationInDays: 1,
    taskName: "Glucose C",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 2,
    durationInDays: 4,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 6,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 7,
    durationInDays: 1,
    taskName: "1st Gumboro - Intermediate",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 8,
    durationInDays: 2,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 10,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 13,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 14,
    durationInDays: 1,
    taskName: "1st Newcastle - HB1",
    taskType: "Vaccination",
    method: "Eye Drop",
    birdType: "BROILER",
  },
  {
    day: 15,
    durationInDays: 6,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 21,
    durationInDays: 1,
    taskName: "2nd Gumboro - Intermediate Plus",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 22,
    durationInDays: 3,
    taskName: "Vitamins + Antibiotics",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 25,
    durationInDays: 3,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 28,
    durationInDays: 1,
    taskName: "2nd Newcastle - Lasota",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 29,
    durationInDays: 6,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 35,
    durationInDays: 4,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "BROILER",
  },
  {
    day: 39,
    durationInDays: 4,
    taskName: "Plain Water (Finishing)",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "BROILER",
  },

  // ============== LAYER SCHEDULE (Programme II) ==============
  {
    day: 1,
    durationInDays: 1,
    taskName: "Glucose C",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 2,
    durationInDays: 4,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 6,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 7,
    durationInDays: 1,
    taskName: "1st Gumboro - Intermediate",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 8,
    durationInDays: 2,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 10,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 13,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 14,
    durationInDays: 1,
    taskName: "1st Newcastle - HB1",
    taskType: "Vaccination",
    method: "Eye Drop",
    birdType: "LAYER",
  },
  {
    day: 15,
    durationInDays: 2,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 17,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 20,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 21,
    durationInDays: 1,
    taskName: "2nd Gumboro-Intermediate Plus",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 22,
    durationInDays: 2,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 24,
    durationInDays: 3,
    taskName: "Coccidiostat+Vitamins+Antibiotics",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 27,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 28,
    durationInDays: 1,
    taskName: "2nd Newcastle -Lasota",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 29,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 30,
    durationInDays: 3,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 33,
    durationInDays: 2,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 35,
    durationInDays: 1,
    taskName: "2nd Gumboro-Intermediate Plus",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 36,
    durationInDays: 3,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 39,
    durationInDays: 3,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 42,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 43,
    durationInDays: 2,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 45,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 48,
    durationInDays: 4,
    taskName: "Coccidiostat+Vitamins+Antibiotics",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 52,
    durationInDays: 3,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 55,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 56,
    durationInDays: 1,
    taskName: "1st Fowlpox",
    taskType: "Vaccination",
    method: "Wing Web Stab",
    birdType: "LAYER",
  },
  {
    day: 57,
    durationInDays: 2,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 59,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 62,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 63,
    durationInDays: 1,
    taskName: "Deworming",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 64,
    durationInDays: 2,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 66,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 69,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 70,
    durationInDays: 1,
    taskName: "3rd Newcastle -Lasota",
    taskType: "Vaccination",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 71,
    durationInDays: 2,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 73,
    durationInDays: 3,
    taskName: "Coccidiostat Vitamins Antibiotics",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 76,
    durationInDays: 4,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 80,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 83,
    durationInDays: 1,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 84,
    durationInDays: 1,
    taskName: "2nd Fowlpox",
    taskType: "Vaccination",
    method: "Wing Web Stab",
    birdType: "LAYER",
  },
  {
    day: 85,
    durationInDays: 2,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 87,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 90,
    durationInDays: 1,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 91,
    durationInDays: 1,
    taskName: "Debeaking",
    taskType: "Other",
    method: "Procedure",
    birdType: "LAYER",
  },
  {
    day: 92,
    durationInDays: 2,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 94,
    durationInDays: 3,
    taskName: "Vitamins +Antibiotics",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 97,
    durationInDays: 5,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 102,
    durationInDays: 3,
    taskName: "Coccidiostat",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 105,
    durationInDays: 4,
    taskName: "Plain Water",
    taskType: "Other",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 109,
    durationInDays: 3,
    taskName: "Vitamins",
    taskType: "Medication",
    method: "Drinking Water",
    birdType: "LAYER",
  },
  {
    day: 112,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },

  // Recurring Newcastle vaccinations for Layers (every 2 months for 2 years)
  {
    day: 172,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 232,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 292,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 352,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 412,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 472,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 532,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 592,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 652,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
  {
    day: 712,
    durationInDays: 1,
    taskName: "Inactivated Newcastle-Newcarvac",
    taskType: "Vaccination",
    method: "Injection",
    birdType: "LAYER",
  },
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

const healthScheduleTemplates = consolidateTemplates(
  rawHealthScheduleTemplates
);

const taskTemplates = [
  // Broilers
  {
    birdType: FlockType.BROILER,
    ageStartDays: 0,
    ageEndDays: 7,
    taskName: "Feed Broilers (Starter)",
    taskDescription: "Provide starter feed.",
    timesPerDay: 6,
  },
  {
    birdType: FlockType.BROILER,
    ageStartDays: 8,
    ageEndDays: 21,
    taskName: "Feed Broilers (Grower)",
    taskDescription: "Provide grower feed.",
    timesPerDay: 4,
  },
  {
    birdType: FlockType.BROILER,
    ageStartDays: 22,
    ageEndDays: 42,
    taskName: "Feed Broilers (Finisher)",
    taskDescription: "Provide finisher feed.",
    timesPerDay: 3,
  },
  {
    birdType: FlockType.BROILER,
    ageStartDays: 43,
    ageEndDays: 1000,
    taskName: "Feed Broilers (Post-finisher)",
    taskDescription: "Provide post-finisher feed.",
    timesPerDay: 2,
  },

  // Layers
  {
    birdType: FlockType.LAYER,
    ageStartDays: 0,
    ageEndDays: 42,
    taskName: "Feed Layers (Starter)",
    taskDescription: "Provide starter mash.",
    timesPerDay: 3,
  },
  {
    birdType: FlockType.LAYER,
    ageStartDays: 43,
    ageEndDays: 126,
    taskName: "Feed Layers (Grower)",
    taskDescription: "Provide grower mash.",
    timesPerDay: 2,
  },
  {
    birdType: FlockType.LAYER,
    ageStartDays: 127,
    ageEndDays: 1000,
    taskName: "Feed Layers (Layer Mash)",
    taskDescription: "Provide layer mash.",
    timesPerDay: 2,
  },
  {
    birdType: FlockType.LAYER,
    ageStartDays: 127,
    ageEndDays: 1000,
    taskName: "Collect Eggs",
    taskDescription: "Collect eggs from the nests.",
    timesPerDay: 2,
  },
];

async function seedUsers() {
  console.log("Seeding users...");
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    {
      email: "admin@example.com",
      name: "Admin User",
      userType: UserType.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
    },
    {
      email: "worker@example.com",
      name: "Farmer User",
      userType: UserType.FARMER,
      approvalStatus: ApprovalStatus.APPROVED,
    },
    {
      email: "vet@example.com",
      name: "Vet User",
      userType: UserType.VET,
      approvalStatus: ApprovalStatus.APPROVED,
    },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash: passwordHash,
          userType: user.userType,
          ownerApprovalStatus: user.approvalStatus,
          emailVerified: new Date(),
        },
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }
  console.log("Users seeded.");
}

async function seedTaskTemplates() {
  console.log("Seeding task templates...");
  for (const template of taskTemplates) {
    await prisma.taskTemplate.upsert({
      where: {
        birdType_ageStartDays_ageEndDays_taskName: {
          birdType: template.birdType,
          ageStartDays: template.ageStartDays,
          ageEndDays: template.ageEndDays,
          taskName: template.taskName,
        },
      },
      update: {},
      create: template,
    });
  }
  console.log("Task templates seeded.");
}

async function seedHealthTemplates() {
  console.log("Seeding health schedule templates...");
  await prisma.healthScheduleTemplate.deleteMany({});
  console.log("Cleared old health schedule templates.");

  for (const template of healthScheduleTemplates) {
    const birdType = FlockType[template.birdType];
    if (!birdType) {
      console.warn(
        `Skipping template with invalid birdType: ${template.birdType}`
      );
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
  console.log("Health schedule templates seeded.");
}

async function main() {
  await seedUsers();
  await seedTaskTemplates();
  await seedHealthTemplates();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
