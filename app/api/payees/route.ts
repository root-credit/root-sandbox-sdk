import { NextRequest, NextResponse } from 'next/server';
import { createPayee, listPayees } from '@/app/actions/payees';
import { createPayeeInputSchema } from '@/lib/types/payee';

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
    const payerId = body.payerId;
    if (!payerId) {
      return NextResponse.json({ error: 'Missing payerId' }, { status: 400 });
    }
    const input = createPayeeInputSchema.parse(body);
    const result = await createPayee(payerId, input);
    return NextResponse.json(result, { status: 201 });
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
    const payees = await listPayees(payerId);
    return NextResponse.json({ payees }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 500);
  }
}
