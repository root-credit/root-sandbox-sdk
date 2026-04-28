/**
 * Example webhook handler — drop into `app/api/webhooks/root/route.ts`.
 *
 * NOTE: This is a reference file inside `prompts/`, not a live route.
 * The shape is illustrative; signature verification details must match the
 * exact format Root uses (consult `sdk/LLM.md`).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { redis, getTransaction, setTransaction } from '@/lib/redis';
import { PayoutStatus } from '@/lib/types/payments';

const SECRET = process.env.ROOT_WEBHOOK_SECRET;
if (!SECRET) {
  // Fail-fast: the route should never run without a secret configured.
  console.warn('[webhook] Missing ROOT_WEBHOOK_SECRET — handler will reject all events.');
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get('x-root-signature') ?? '';

  if (!SECRET) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const expected = createHmac('sha256', SECRET).update(raw).digest('hex');
  const provided = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  if (
    provided.length !== expectedBuf.length ||
    !timingSafeEqual(provided, expectedBuf)
  ) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { type: string; data: { id: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const targetStatus =
    event.type === 'payout.completed'
      ? PayoutStatus.Completed
      : event.type === 'payout.failed'
        ? PayoutStatus.Failed
        : null;

  if (!targetStatus) {
    console.warn('[webhook] Ignoring unknown event type:', event.type);
    return NextResponse.json({ ok: true });
  }

  // Find the transaction by Root payout id (lookup via the index set you
  // maintain — for the demo we scan transaction:* keys).
  const keys = await redis.keys('transaction:*');
  for (const key of keys) {
    const id = key.replace(/^transaction:/, '');
    const tx = await getTransaction(id);
    if (tx?.rootPayoutId === event.data.id) {
      if (tx.status !== targetStatus) {
        await setTransaction(id, { ...tx, status: targetStatus, completedAt: Date.now() });
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
