// app/api/farms/[farmId]/flocks/[flockId]/mortality-records/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/app/lib/session";
import { z } from "zod";

const prisma = new PrismaClient();

const paramsSchema = z.object({
  farmId: z.string(),
  flockId: z.string(),
});

const postBodySchema = z.object({
  quantity: z.number().int().positive(),
  cause: z.string().optional(),
  // Remove date from the schema since we'll use server-side date
});

export async function POST(req, { params }) {
  try {
    // Fix 1: Await params first
    const resolvedParams = await params;
    const { farmId, flockId } = paramsSchema.parse(resolvedParams);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Authorization check
    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId: farmId,
        userId: currentUser.id,
      },
    });

    if (!farmUser && currentUser.userType !== "ADMIN") {
      return new Response("You don't have access to this farm", {
        status: 403,
      });
    }

    const body = await req.json();
    const { quantity, cause } = postBodySchema.parse(body);

    // Fix 2: Use server-side date
    const currentDate = new Date();

    // Use a transaction to record mortality and update flock quantity
    const [, newRecord] = await prisma.$transaction([
      prisma.flock.update({
        where: { id: flockId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      }),
      prisma.mortalityRecord.create({
        data: {
          flockId: flockId,
          date: currentDate, // Use server-side date
          quantity,
          cause,
        },
      }),
    ]);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating mortality record:", error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
