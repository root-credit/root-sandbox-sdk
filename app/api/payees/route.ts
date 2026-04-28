import { NextRequest, NextResponse } from 'next/server';
import { listPayees, createPayee } from '@/app/actions/payees';
import { createPayeeInputSchema } from '@/lib/types/payee';

/**
 * Thin route delegators around the typed Server Actions in `app/actions/payees.ts`.
 * Kept for compatibility with non-React HTTP clients. Components MUST use the
 * `usePayees` / `useCreatePayee` hooks instead of calling these endpoints directly.
 */

function errorResponse(error: unknown, defaultStatus: number) {
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Merchant not found') {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: defaultStatus });
  }
  return NextResponse.json({ error: 'Unknown error' }, { status: defaultStatus });
}

export async function GET(request: NextRequest) {
  try {
    const merchantId = request.nextUrl.searchParams.get('merchantId');
    if (!merchantId) {
      return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
    }
    const payees = await listPayees(merchantId);
    return NextResponse.json({ payees }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const merchantId = body.merchantId;
    if (!merchantId) {
      return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
    }
    const input = createPayeeInputSchema.parse(body);
    const result = await createPayee(merchantId, input);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
