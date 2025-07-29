// app/api/farms/[farmId]/flocks/[flockId]/bird-resales/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction } from '@/app/lib/logging';
import { z } from 'zod';

const prisma = new PrismaClient();

const postBodySchema = z.object({
    quantity: z.number().int().positive("Quantity must be a positive number."),
    revenue: z.number().positive("Revenue must be a positive number."),
    notes: z.string().optional(),
});

export async function POST(request, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { farmId, flockId } = params;
    
    try {
        const body = await request.json();
        const { quantity, revenue, notes } = postBodySchema.parse(body);

        const flock = await prisma.flock.findUnique({
            where: { id: flockId },
            select: { farmId: true, quantity: true, name: true }
        });

        if (!flock || flock.farmId !== farmId) {
            await logAction('WARN', `User ${user.id} failed to find flock ${flockId} in farm ${farmId}.`);
            return NextResponse.json({ error: 'Flock not found' }, { status: 404 });
        }

        const farm = await prisma.farm.findUnique({ where: { id: farmId } });
        const farmUser = await prisma.farmUser.findFirst({ where: { farmId, userId: user.id } });

        if (!farm || (farm.ownerId !== user.id && !farmUser && user.userType !== 'ADMIN')) {
            await logAction('WARN', `User ${user.id} unauthorized to record bird sale for flock ${flockId}.`);
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        if (quantity > flock.quantity) {
            return NextResponse.json({ error: 'Cannot sell more birds than available in the flock.' }, { status: 400 });
        }

        const newQuantity = flock.quantity - quantity;
        const shouldArchive = newQuantity <= 0;

        const transactionResult = await prisma.$transaction(async (prisma) => {
            const newSale = await prisma.birdResale.create({
                data: {
                    flockId,
                    quantity,
                    revenue,
                    notes,
                    recordedById: user.id,
                    date: new Date(),
                },
            });

            const updatedFlock = await prisma.flock.update({
                where: { id: flockId },
                data: {
                    quantity: {
                        decrement: quantity,
                    },
                    ...(shouldArchive && { status: 'archived' }),
                },
            });

            await prisma.revenue.create({
                data: {
                    farmId,
                    amount: revenue,
                    category: 'Bird Sales',
                    description: `Sale of ${quantity} birds from flock: ${flock.name}`,
                    customer: notes,
                    date: new Date(),
                }
            });
            
            return { newSale, updatedFlock };
        });

        await logAction('INFO', `Recorded sale of ${quantity} birds from flock ${flockId}`, { 
            userId: user.id, 
            farmId,
            saleId: transactionResult.newSale.id 
        });

        if (shouldArchive) {
            await logAction('INFO', `Flock ${flockId} was automatically archived due to zero quantity.`, { 
                userId: user.id, 
                farmId 
            });
        }

        return NextResponse.json(transactionResult.newSale, { status: 201 });

    } catch (error) {
        console.error('Error recording bird sale:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        await logAction('ERROR', `Error recording bird sale: ${error.message}`, { userId: user.id, farmId });
        return NextResponse.json({ error: 'Failed to record bird sale' }, { status: 500 });
    }
}
