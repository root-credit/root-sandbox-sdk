import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No session' },
        { status: 401 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('[v0] Session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
