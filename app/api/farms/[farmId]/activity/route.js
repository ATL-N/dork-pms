// app/api/farms/[farmId]/activity/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/app/lib/session";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";

const prisma = new PrismaClient();

const routeContextSchema = z.object({
  params: z.object({
    farmId: z.string(),
  }),
});

// A map to create more user-friendly log messages
const activityMessageMap = {
  VACCINATION_RECORDED: (log) =>
    `Vaccination '${log.meta?.vaccine}' recorded for ${log.meta?.flockName}.`,
  MORTALITY_RECORDED: (log) =>
    `${log.meta?.quantity} mortalities recorded for ${log.meta?.flockName}.`,
  FEED_CONSUMPTION_RECORDED: (log) =>
    `Feed consumption recorded for ${log.meta?.flockName}.`,
  EXPENSE_ADDED: (log) =>
    `New expense of ${log.meta?.amount} added for ${log.meta?.category}.`,
  REVENUE_ADDED: (log) =>
    `New revenue of ${log.meta?.amount} from ${log.meta?.category}.`,
  FLOCK_CREATED: (log) => `New flock '${log.meta?.flockName}' was created.`,
  USER_INVITED: (log) =>
    `${log.meta?.email} was invited to the farm as a ${log.meta?.role}.`,
};

export async function GET(req, context) {
  try {
    // Await the params before using them
    const { params } = routeContextSchema.parse({
      params: await context.params,
    });

    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    const farmUser = await prisma.farmUser.findUnique({
      where: {
        farmId_userId: {
          farmId: params.farmId,
          userId: currentUser.id,
        },
      },
    });

    const farm = await prisma.farm.findUnique({
      where: { id: params.farmId },
    });

    if (
      !farmUser &&
      farm?.ownerId !== currentUser.id &&
      currentUser.userType !== "ADMIN"
    ) {
      return new Response("You don't have access to this farm", {
        status: 403,
      });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const logs = await prisma.log.findMany({
      where: {
        meta: {
          path: ["farmId"],
          equals: params.farmId,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const formattedActivities = logs.map((log) => {
      const messageGenerator =
        activityMessageMap[log.message] || (() => log.message);
      return {
        id: log.id,
        action: messageGenerator(log),
        user: log.user?.name || log.user?.email || "System",
        time: formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }),
      };
    });

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("Error fetching farm activity:", error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
