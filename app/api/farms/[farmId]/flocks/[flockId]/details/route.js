// app/api/farms/[farmId]/flocks/[flockId]/details/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/app/lib/session";
import { z } from "zod";
import { logAction } from "@/app/lib/logging";

const prisma = new PrismaClient();

const paramsSchema = z.object({
  farmId: z.string(),
  flockId: z.string(),
});

export async function GET(req, { params }) {
  try {
    // Fix: Await params first
    const resolvedParams = await params;
    const { farmId, flockId } = paramsSchema.parse(resolvedParams);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      await logAction(
        "WARN",
        `Unauthorized attempt to fetch flock details for flock ${flockId}`
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authorization check
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId: farmId,
        userId: currentUser.id,
      },
    });

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });

    if (
      !farmUser &&
      farm?.ownerId !== currentUser.id &&
      currentUser.userType !== "ADMIN"
    ) {
      await logAction(
        "ERROR",
        `User ${currentUser.id} forbidden to view details for flock ${flockId}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const flockDetails = await prisma.flock.findUnique({
      where: {
        id: flockId,
        farmId: farmId,
      },
      include: {
        growthRecords: { orderBy: { date: "desc" }, take: 5 },
        eggProductionRecords: { orderBy: { date: "desc" }, take: 5 },
        mortalityRecords: { orderBy: { date: "desc" }, take: 5 },
        healthTasks: { orderBy: { completedDate: "desc" }, take: 5 },
        feedConsumption: {
          orderBy: { date: "desc" },
          take: 5,
          include: { feedItem: true },
        },
        birdResales: { orderBy: { date: "desc" }, take: 5 },
      },
    });

    if (!flockDetails) {
      return NextResponse.json({ error: "Flock not found" }, { status: 404 });
    }

    await logAction(
      "INFO",
      `User ${currentUser.id} fetched details for flock ${flockId}`
    );
    return NextResponse.json(flockDetails);
  } catch (error) {
    await logAction("ERROR", `Error fetching flock details`, {
      error: error.message,
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
