
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getUserFarmRole } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET all invoices for a farm
export async function GET(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = await params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: { farmId },
      orderBy: { date: 'desc' },
    });
    return new Response(JSON.stringify(invoices), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), { status: 500 });
  }
}

// POST a new invoice
export async function POST(request, { params }) {
  const session = await getSession({ req: request });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { farmId } = await params;
  const userId = session.user.id;

  const role = await getUserFarmRole(userId, farmId);
  if (role !== 'OWNER' && role !== 'MANAGER') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const newInvoice = await prisma.invoice.create({
      data: {
        ...body,
        farmId: farmId,
      },
    });
    return new Response(JSON.stringify(newInvoice), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create invoice' }), { status: 500 });
  }
}
