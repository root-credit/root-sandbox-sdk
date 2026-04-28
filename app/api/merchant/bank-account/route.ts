import { NextRequest, NextResponse } from 'next/server';
import { linkMerchantBank } from '@/app/actions/merchant';
import { linkBankInputSchema } from '@/lib/types/merchant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const merchantId = body.merchantId;
    if (!merchantId) {
      return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
    }
    const input = linkBankInputSchema.parse(body);
    const result = await linkMerchantBank(merchantId, input);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Merchant not found') {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link bank account' },
      { status: 400 }
    );
  }
}
