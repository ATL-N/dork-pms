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
        const { eggSaleId, transactionId, farmId, date, quantity, amount, customer } = body;

        if (!eggSaleId || !transactionId || !farmId || !date || !quantity || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [newTransaction, newEggSale, farmSummary] = await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    id: transactionId,
                    farmId,
                    date: new Date(date),
                    type: 'REVENUE',
                    category: 'Egg Sale',
                    amount,
                    customer,
                },
            }),
            prisma.eggSale.create({
                data: {
                    id: eggSaleId,
                    farmId,
                    quantity,
                    amount,
                    date: new Date(date),
                    customer,
                    recordedById: currentUser.id,
                    transactionId,
                },
            }),
            prisma.farmSummary.update({
                where: { farmId },
                data: {
                    totalEggsAvailable: {
                        decrement: quantity,
                    },
                },
            }),
        ]);

        return NextResponse.json({ eggSale: newEggSale, transaction: newTransaction }, { status: 201 });

    } catch (error) {
        console.error(`Error creating egg sale:`, error);
        return NextResponse.json({ error: 'Failed to create egg sale' }, { status: 500 });
    }
}
