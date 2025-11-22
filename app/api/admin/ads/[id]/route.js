// app/api/admin/ads/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';

// GET a single advertisement by ID
export async function GET(request, { params }) {
  const { id } = await params;
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ad = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error(`[API/ADMIN/ADS/${id}] GET Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch advertisement' }, { status: 500 });
  }
}

// PUT (update) an advertisement by ID
export async function PUT(request, { params }) {
  const { id } = await params;
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, body, imageUrl, callToActionText, callToActionUrl, priority, isActive } = data;

    if (!title || !imageUrl || !callToActionText || !callToActionUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: {
        title,
        body,
        imageUrl,
        callToActionText,
        callToActionUrl,
        priority: parseInt(priority, 10) || 10,
        isActive,
      },
    });

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error(`[API/ADMIN/ADS/${id}] PUT Error:`, error);
    return NextResponse.json({ error: 'Failed to update advertisement' }, { status: 500 });
  }
}

// DELETE an advertisement by ID
export async function DELETE(request, { params }) {
  const { id } = await params;
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.advertisement.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`[API/ADMIN/ADS/${id}] DELETE Error:`, error);
    return NextResponse.json({ error: 'Failed to delete advertisement' }, { status: 500 });
  }
}
