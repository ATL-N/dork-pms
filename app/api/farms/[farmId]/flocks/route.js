// app/api/farms/[farmId]/flocks/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/app/lib/session";
import { logAction } from "@/app/lib/logging";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

// GET all flocks for a specific farm
export async function GET(request, { params }) {
  const { farmId } = await params;
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const farmUser = await prisma.farmUser.findUnique({
      where: { farmId_userId: { farmId, userId: user.id } },
    });

    if (!farmUser) {
      return NextResponse.json(
        { error: "You do not have access to this farm." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    const whereClause = {
      farmId,
    };

    if (since) {
      whereClause.updatedAt = {
        gt: new Date(since),
      };
    }

    const flocks = await prisma.flock.findMany({
      where: whereClause,
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(flocks);
  } catch (error) {
    await logAction({
      level: "ERROR",
      message: `Failed to fetch flocks for farm ${farmId}. Error: ${error.message}`,
      userId: user.id,
      meta: { farmId, stack: error.stack },
    });
    return NextResponse.json(
      { error: "Failed to fetch flocks" },
      { status: 500 }
    );
  }
}

// POST a new flock to a specific farm and generate its health schedule
export async function POST(request, { params }) {
  const { farmId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const farmUser = await prisma.farmUser.findFirst({
      where: { farmId, userId: user.id, role: { in: ["OWNER", "MANAGER"] } },
    });

    if (user.userType !== 'ADMIN' && !farmUser) {
      return NextResponse.json(
        { error: "You do not have permission to add flocks to this farm." },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { name, type, breed, quantity, startDate, location, costPerBird } =
      data;

    if (!name || !type || !quantity || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Transaction to create flock and its health tasks together
    const newFlock = await prisma.$transaction(async (tx) => {
      const flock = await tx.flock.create({
        data: {
          farmId,
          name,
          type,
          breed,
          quantity: parseInt(quantity),
          initialQuantity: parseInt(quantity),
          startDate: new Date(startDate),
          location,
          costPerBird: costPerBird ? parseFloat(costPerBird) : null,
        },
      });

      // Now, generate the health tasks
      const templates = await tx.healthScheduleTemplate.findMany({
        where: { birdType: type },
      });

      if (templates.length > 0) {
        const healthTasks = templates.map((template) => ({
          flockId: flock.id,
          taskName: template.taskName,
          taskType: template.taskType,
          method: template.method,
          scheduledDate: addDays(new Date(startDate), template.day),
          durationInDays: template.durationInDays,
          status: "SCHEDULED",
          notes: template.notes || "",
        }));

        await tx.healthTask.createMany({
          data: healthTasks,
        });
      }

      return flock;
    });

    await logAction({
      level: "INFO",
      message: `User ${user.email} created new flock '${name}' in farm ${farmId}.`,
      userId: user.id,
      meta: { farmId, flockId: newFlock.id, flockName: name },
    });

    return NextResponse.json(newFlock, { status: 201 });
  } catch (error) {
    await logAction(
      "ERROR",
      `Failed to create flock for farm ${farmId}. Error: ${error.message}`,
      { userId: user.id, farmId, stack: error.stack }
    );
    return NextResponse.json(
      { error: "Failed to create flock" },
      { status: 500 }
    );
  }
}
