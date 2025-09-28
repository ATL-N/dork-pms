import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/session';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ message: 'Authentication failed: User not found' }, { status: 401 });
    }

    // The getCurrentUser function now returns a composite user object,
    // so we can return it directly.
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
