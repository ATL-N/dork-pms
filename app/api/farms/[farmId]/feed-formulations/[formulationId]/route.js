// app/api/farms/[farmId]/feed-formulations/[formulationId]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';

const prisma = new PrismaClient();

// PUT to update a feed formulation
export async function PUT(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId, formulationId } = await params;
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
        return NextResponse.json({ error: 'Not authorized to update formulations' }, { status: 403 });
      }
    }

    // Using a transaction to ensure atomicity
    const updatedFormulation = await prisma.$transaction(async (tx) => {
      // Delete existing ingredients
      await tx.formulationIngredient.deleteMany({
        where: { formulationId },
      });

      // Update formulation and create new ingredients
      return tx.feedFormulation.update({
        where: { id: formulationId },
        data: {
          name,
          description,
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
    });

    await logAction('INFO', `Feed formulation '${name}' (ID: ${formulationId}) updated for farm ${farmId}`, { userId: user.id });

    return NextResponse.json(updatedFormulation);
  } catch (error) {
    console.error('Error updating feed formulation:', error);
    await logAction('ERROR', `Error updating feed formulation ${formulationId}: ${error.message}`, { userId: user.id });
    return NextResponse.json({ error: 'Failed to update feed formulation' }, { status: 500 });
  }
}

// DELETE a feed formulation
export async function DELETE(request, { params }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { farmId, formulationId } = await params;

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
        return NextResponse.json({ error: 'Not authorized to delete formulations' }, { status: 403 });
      }
    }

    const deletedFormulation = await prisma.feedFormulation.delete({
      where: { id: formulationId },
    });
    
    await logAction('WARN', `Feed formulation '${deletedFormulation.name}' (ID: ${formulationId}) deleted from farm ${farmId}`, { userId: user.id });

    return NextResponse.json({ message: 'Feed formulation deleted successfully' });
  } catch (error) {
    console.error('Error deleting feed formulation:', error);
     await logAction('ERROR', `Error deleting feed formulation ${formulationId}: ${error.message}`, { userId: user.id });
    return NextResponse.json({ error: 'Failed to delete feed formulation' }, { status: 500 });
  }
}