
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getUserFarmRole } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET all expenses for a farm
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
    const expenses = await prisma.expense.findMany({
      where: { farmId },
      orderBy: { date: 'desc' },
    });
    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch expenses' }), { status: 500 });
  }
}

// POST a new expense
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
    const newExpense = await prisma.expense.create({
      data: {
        ...body,
        farmId: farmId,
      },
    });
    return new Response(JSON.stringify(newExpense), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create expense' }), { status: 500 });
  }
}
