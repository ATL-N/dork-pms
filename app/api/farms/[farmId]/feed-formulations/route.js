// app/api/farms/[farmId]/feed-formulations/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

// GET all feed formulations for a farm
export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = await params;

  try {
    // Authorization check
    const farmUser = await prisma.farmUser.findUnique({
      where: { farmId_userId: { farmId, userId: user.id } },
    });
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });

    if (!farmUser && farm?.ownerId !== user.id && user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const formulations = await prisma.feedFormulation.findMany({
      where: { farmId },
      include: {
        ingredients: {
          include: {
            feedItem: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(formulations);
  } catch (error) {
    console.error('Error fetching feed formulations:', error);
    return NextResponse.json({ error: 'Failed to fetch feed formulations' }, { status: 500 });
  }
}

// POST a new feed formulation
export async function POST(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId } = await params;
  const { name, description, ingredients } = await request.json();

  if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ error: 'Name and at least one ingredient are required' }, { status: 400 });
  }

  try {
    // Authorization check
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.ownerId !== user.id) {
      const farmUser = await prisma.farmUser.findUnique({
        where: {
          farmId_userId: { farmId, userId: user.id },
          role: { in: ['OWNER', 'MANAGER'] },
        },
      });
      if (!farmUser && user.userType !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized to create formulations' }, { status: 403 });
      }
    }

    const newFormulation = await prisma.feedFormulation.create({
      data: {
        name,
        description,
        farmId,
        createdById: user.id,
        ingredients: {
          create: ingredients.map(ing => ({
            feedItemId: ing.feedItemId,
            quantity: parseFloat(ing.quantity),
            percentage: parseFloat(ing.percentage),
          })),
        },
      },
      include: {
        ingredients: { include: { feedItem: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    await logAction('INFO', `Feed formulation '${name}' created for farm ${farmId}`, { userId: user.id });

    return NextResponse.json(newFormulation, { status: 201 });
  } catch (error) {
    console.error('Error creating feed formulation:', error);
    await logAction('ERROR', `Error creating feed formulation for farm ${farmId}: ${error.message}`, { userId: user.id });
    return NextResponse.json({ error: 'Failed to create feed formulation' }, { status: 500 });
  }
}