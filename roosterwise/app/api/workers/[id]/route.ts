import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';
import { deleteWorker } from '@/lib/redis';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { restaurantId } = body;

    if (restaurantId !== session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await deleteWorker(id, restaurantId);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Delete worker error:', error);
    return NextResponse.json(
      { error: 'Failed to delete worker' },
      { status: 500 }
    );
  }
}
