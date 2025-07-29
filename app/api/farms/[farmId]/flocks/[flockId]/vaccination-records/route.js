// app/api/farms/[farmId]/flocks/[flockId]/vaccination-records/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { z } from 'zod';

const prisma = new PrismaClient();

const routeContextSchema = z.object({
  params: z.object({
    farmId: z.string(),
    flockId: z.string(),
  }),
});

const postBodySchema = z.object({
    vaccine: z.string().min(1, "Vaccine name is required"),
});

export async function GET(req, context) {
  try {
    const { params } = routeContextSchema.parse(context);
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId: params.farmId,
        userId: currentUser.id,
      },
    });

    if (!farmUser && currentUser.userType !== 'ADMIN') {
      return new Response("You don't have access to this farm", { status: 403 });
    }

    const vaccinationRecords = await prisma.vaccinationRecord.findMany({
      where: {
        flockId: params.flockId,
      },
      orderBy: {
        date: 'desc',
      }
    });

    return NextResponse.json(vaccinationRecords);
  } catch (error) {
    console.error('Error fetching vaccination records:', error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req, context) {
  try {
    const { params } = routeContextSchema.parse(context);
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const farmUser = await prisma.farmUser.findFirst({
      where: {
        farmId: params.farmId,
        userId: currentUser.id,
      },
    });

    if (!farmUser && currentUser.userType !== 'ADMIN') {
      return new Response("You don't have access to this farm", { status: 403 });
    }

    const body = await req.json();
    const { vaccine } = postBodySchema.parse(body);

    const newRecord = await prisma.vaccinationRecord.create({
        data: {
            flockId: params.flockId,
            vaccine,
        }
    });

    return NextResponse.json(newRecord, { status: 201 });

  } catch (error) {
    console.error('Error creating vaccination record:', error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
