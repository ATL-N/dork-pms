
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getUserFarmRole } from '../../../../../lib/auth';

const prisma = new PrismaClient();

// UPDATE a specific invoice
export async function PUT(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, invoiceId } = params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId, farmId: farmId },
      data: body,
    });
    return new Response(JSON.stringify(updatedInvoice), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update invoice' }), { status: 500 });
  }
}

// DELETE a specific invoice
export async function DELETE(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId, invoiceId } = params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    await prisma.invoice.delete({
      where: { id: invoiceId, farmId: farmId },
    });
    return new Response(null, { status: 204 }); // No content
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete invoice' }), { status: 500 });
  }
}
