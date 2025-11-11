// app/api/farms/[farmId]/flocks/[flockId]/mortality-records/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/app/lib/session";
import { z } from "zod";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { farmId, flockId } = params;
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const farmAccess = await prisma.farmUser.findUnique({
    where: {
      farmId_userId: {
        farmId: farmId,
        userId: user.id,
      },
    },
  });

  if (!farmAccess && user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'date';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const records = await prisma.mortalityRecord.findMany({
      where: {
        flockId: flockId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        flock: true,
        recordedBy: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: page * limit,
      take: limit,
    });

    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch mortality records:", error);
    return NextResponse.json({ error: 'Failed to fetch mortality records' }, { status: 500 });
  }
}

const paramsSchema = z.object({
  farmId: z.string(),
  flockId: z.string(),
});

const postBodySchema = z.object({
  quantity: z.number().int().positive(),
  cause: z.string().nullable().optional(), // Allow null and optional
  date: z.string().optional(), // Keep date optional as it can be set on the server
});

export async function POST(req, { params }) {
  try {
    // Fix 1: Await params first
    const resolvedParams = await params;
    const { farmId, flockId } = paramsSchema.parse(resolvedParams);

    const currentUser = await getCurrentUser(req);

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
    const { quantity, cause, date } = postBodySchema.parse(body);

    const flock = await prisma.flock.findUnique({ where: { id: flockId } });
    if (quantity > flock.quantity) {
      return new Response("Mortality quantity cannot be greater than the number of birds in the flock.", { status: 400 });
    }

    // Use server-side date if not provided
    const recordDate = date ? new Date(date) : new Date();

    // Use a transaction to record mortality and update flock quantity
    const newRecord = await prisma.$transaction(async (prisma) => {
      const flock = await prisma.flock.findUnique({ where: { id: flockId } });
      const newQuantity = flock.quantity - quantity;

      await prisma.flock.update({
        where: { id: flockId },
        data: {
          quantity: {
            decrement: quantity,
          },
          status: newQuantity <= 0 ? 'archived' : undefined,
        },
      });

      return await prisma.mortalityRecord.create({
        data: {
          id: body.id, // Use the ID from the request body
          flockId: flockId,
          date: recordDate,
          quantity,
          cause,
          recordedById: currentUser.id,
        },
      });
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating mortality record:", error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
