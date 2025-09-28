const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const farms = await prisma.farm.findMany({
    include: {
      flocks: {
        where: { status: 'active' },
      },
      customTaskSchedules: true,
    },
  });

  for (const farm of farms) {
    if (farm.useCustomSchedule && farm.customTaskSchedules.length > 0) {
      // Use custom schedules for this farm
      for (const flock of farm.flocks) {
        for (const schedule of farm.customTaskSchedules) {
          await generateTasksFromSchedule(flock, schedule);
        }
      }
    } else {
      // Use default task templates
      for (const flock of farm.flocks) {
        await generateTasksFromTemplate(flock);
      }
    }
  }
}

async function generateTasksFromSchedule(flock, schedule) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingTasks = await prisma.task.findMany({
    where: {
      flockId: flock.id,
      title: schedule.taskName,
      dueDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (existingTasks.length === 0) {
    for (const time of schedule.times) {
      const [hours, minutes] = time.split(':');
      const dueDate = new Date();
      dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      await prisma.task.create({
        data: {
          farmId: flock.farmId,
          flockId: flock.id,
          title: schedule.taskName,
          description: `Custom scheduled task: ${schedule.taskName}`,
          dueDate: dueDate,
          status: 'PENDING',
        },
      });
    }
    console.log(`Created ${schedule.times.length} tasks for flock ${flock.name} from custom schedule "${schedule.taskName}"`);
  } else {
    console.log(`Tasks for flock ${flock.name} from custom schedule "${schedule.taskName}" already exist for today.`);
  }
}

async function generateTasksFromTemplate(flock) {
  const ageInDays = Math.floor((new Date() - new Date(flock.startDate)) / (1000 * 60 * 60 * 24));

  const taskTemplates = await prisma.taskTemplate.findMany({
    where: {
      birdType: flock.type,
      ageStartDays: { lte: ageInDays },
      ageEndDays: { gte: ageInDays },
    },
  });

  for (const template of taskTemplates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingTasks = await prisma.task.findMany({
      where: {
        flockId: flock.id,
        title: template.taskName,
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingTasks.length === 0) {
      // Create tasks for the day based on timesPerDay
      const now = new Date();
      for (let i = 0; i < template.timesPerDay; i++) {
          const dueDate = new Date();
          dueDate.setHours(now.getHours() + i * (24 / template.timesPerDay));
          
          await prisma.task.create({
              data: {
                  farmId: flock.farmId,
                  flockId: flock.id,
                  title: template.taskName,
                  description: template.taskDescription,
                  dueDate: dueDate,
                  status: 'PENDING',
              },
          });
      }
      console.log(`Created ${template.timesPerDay} tasks for flock ${flock.name} based on template "${template.taskName}"`);
    } else {
      console.log(`Tasks for flock ${flock.name} based on template "${template.taskName}" already exist for today.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
