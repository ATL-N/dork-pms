import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/session';
import { logAction as createLog } from '@/app/lib/logging';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateInvoiceSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']),
});

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { invoiceId } = params;
  if (!invoiceId) {
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = updateInvoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status } = validation.data;

    const invoiceToUpdate = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    });

    if (!invoiceToUpdate) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Optional: Check if user has permission for the farm associated with the invoice
    // This adds a layer of security.
    const farm = await prisma.farm.findUnique({ where: { id: invoiceToUpdate.farmId }});
    const farmUser = await prisma.farmUser.findFirst({ where: { farmId: invoiceToUpdate.farmId, userId: currentUser.id }});

    if (currentUser.userType !== 'ADMIN' && farm.ownerId !== currentUser.id && !farmUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });

    await createLog(
      'INFO',
      `User ${currentUser.email} updated invoice ${updatedInvoice.invoiceNumber} to ${status}.`,
      { userId: currentUser.id, invoiceId, farmId: updatedInvoice.farmId, newStatus: status },
    );

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error(`Error updating invoice ${invoiceId}:`, error);
    await createLog(
        'ERROR',
        `Failed to update invoice ${invoiceId}.`,
        { userId: currentUser.id, error: error.message }
    );
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}