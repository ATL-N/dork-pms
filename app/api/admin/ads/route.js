// app/api/admin/ads/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';

// GET all advertisements
export async function GET(request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ads = await prisma.advertisement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(ads);
  } catch (error) {
    console.error('[API/ADMIN/ADS] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
}

// POST a new advertisement
export async function POST(request) {
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

    const newAd = await prisma.advertisement.create({
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

    return NextResponse.json(newAd, { status: 201 });
  } catch (error) {
    console.error('[API/ADMIN/ADS] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create advertisement' }, { status: 500 });
  }
}
