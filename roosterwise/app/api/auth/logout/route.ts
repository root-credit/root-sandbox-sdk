import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (sessionToken) {
      await deleteSession(sessionToken);
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
