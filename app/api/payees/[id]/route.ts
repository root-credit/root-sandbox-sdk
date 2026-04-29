import { NextRequest, NextResponse } from 'next/server';
import { removePayee } from '@/app/actions/payees';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { payerId } = body as { payerId?: string };
    if (!payerId) {
      return NextResponse.json({ error: 'Missing payerId' }, { status: 400 });
    }
    await removePayee(payerId, { payeeId: id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove payee' },
      { status: 400 }
    );
  }
}
