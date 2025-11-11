import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as createLog } from '@/app/lib/logging';
import { z } from 'zod';

const prisma = new PrismaClient();

const searchParamsSchema = z.object({
  farmId: z.string().min(1, 'Farm ID is required.'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
});

export async function GET(request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const validation = searchParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { farmId, startDate, endDate, status } = validation.data;
  const since = searchParams.get('since');

  try {
    const whereClause = { farmId };

    if (since) {
      whereClause.updatedAt = {
        gt: new Date(since),
      };
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (status) {
      whereClause.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { id, farmId, invoiceNumber, date, dueDate, type, status, amount, customer, vendor } = body;

    if (!farmId || !invoiceNumber || !date || !type || !status || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!id) {
        id = `inv_${Date.now()}`;
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        id, // Use the client-generated ID or the new server-generated one
        farmId,
        invoiceNumber,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        type,
        status,
        amount: parseFloat(amount),
        customer,
        vendor,
      },
    });
    
    await createLog(
      'INFO',
      `User ${currentUser.email} created invoice ${newInvoice.invoiceNumber} for farm ${farmId}`,
      { userId: currentUser.id, farmId, invoiceId: newInvoice.id },
    );

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    await createLog(
        'ERROR',
        `Error creating invoice for user ${currentUser.email}: ${error.message}`,
        { userId: currentUser.id, farmId: body.farmId, stack: error.stack },
    );
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
