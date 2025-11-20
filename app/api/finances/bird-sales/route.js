import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function POST(request) {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { birdSaleId, transactionId, farmId, flockId, date, quantity, revenue, customer } = body;

        if (!birdSaleId || !transactionId || !farmId || !flockId || !date || !quantity || !revenue) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.upsert({
                where: { id: transactionId },
                update: {}, // Do nothing if it exists
                create: {
                    id: transactionId,
                    farmId,
                    date: new Date(date),
                    type: 'REVENUE',
                    category: 'Bird Sale',
                    amount: revenue,
                    customer,
                },
            });

            const birdSale = await tx.birdResale.create({
                data: {
                    id: birdSaleId,
                    flockId,
                    quantity,
                    revenue,
                    date: new Date(date),
                    recordedById: currentUser.id,
                },
            });

            const flock = await tx.flock.findUnique({ where: { id: flockId } });
            if (!flock) {
                throw new Error('Flock not found');
            }
            const newQuantity = flock.quantity - quantity;

            await tx.flock.update({
                where: { id: flockId },
                data: {
                    quantity: newQuantity,
                    status: newQuantity <= 0 ? 'archived' : flock.status,
                },
            });

            return { birdSale, transaction };
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error(`Error creating bird sale:`, error);
        return NextResponse.json({ error: 'Failed to create bird sale' }, { status: 500 });
    }
}
