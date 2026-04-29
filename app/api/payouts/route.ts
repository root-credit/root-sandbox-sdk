import { NextRequest, NextResponse } from 'next/server';
import { processPayout } from '@/app/actions/payouts';
import { listTransactions } from '@/app/actions/transactions';
import { processPayoutInputSchema } from '@/lib/types/payout';

/**
 * Thin route delegators around the typed Server Actions in `app/actions/payouts.ts`
 * and `app/actions/transactions.ts`. Kept for compatibility with non-React HTTP clients
 * (CLI scripts, webhooks). Components MUST use the hooks in `lib/hooks/*` instead of
 * calling these endpoints directly.
 */

function errorResponse(error: unknown, defaultStatus: number) {
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Payer not found') {
      return NextResponse.json({ error: 'Payer not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: defaultStatus });
  }
  return NextResponse.json({ error: 'Unknown error' }, { status: defaultStatus });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = processPayoutInputSchema.parse(body);
    const result = await processPayout(input);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function GET(request: NextRequest) {
  try {
    const payerId = request.nextUrl.searchParams.get('payerId');
    if (!payerId) {
      return NextResponse.json({ error: 'Missing payerId' }, { status: 400 });
    }
    const transactions = await listTransactions(payerId);
    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 500);
  }
}
