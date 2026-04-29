import { NextRequest, NextResponse } from 'next/server';
import { linkPayerBank } from '@/app/actions/payer';
import { linkBankInputSchema } from '@/lib/types/payer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payerId = body.payerId;
    if (!payerId) {
      return NextResponse.json({ error: 'Missing payerId' }, { status: 400 });
    }
    const input = linkBankInputSchema.parse(body);
    const result = await linkPayerBank(payerId, input);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Payer not found') {
      return NextResponse.json({ error: 'Payer not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: msg || 'Failed to link bank account' },
      { status: 400 }
    );
  }
}
