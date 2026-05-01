'use server';

/**
 * Payout server actions.
 *
 * v0 / LLM contract:
 *   - Components MUST call these via the matching hook in `lib/hooks/*` — NEVER `fetch('/api/...')`.
 *   - Inputs are validated against Zod schemas in `lib/types/*` before any side-effect.
 *   - Money is converted to cents at this boundary; UI passes dollars.
 */

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import {
  getPayer,
  getPayee,
  setTransaction,
} from '@/lib/redis';
import { createPayout, payoutRailForPayee } from '@/lib/root-api';
import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';
import { dollarsToCents } from '@/lib/types/payments';
import {
  processPayoutInputSchema,
  type ProcessPayoutInput,
  type ProcessPayoutResult,
} from '@/lib/types/payout';

/**
 * Process one or more payouts in a single batch. Returns per-line results so the UI
 * can render success/failure for each row independently.
 *
 * Throws if the caller is not signed in as the payer in `input.payerId`.
 */
export async function processPayout(
  input: ProcessPayoutInput
): Promise<ProcessPayoutResult> {
  const parsed = processPayoutInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, parsed.payerId)) {
    throw new Error('Unauthorized');
  }

  const payer = await getPayer(parsed.payerId);
  if (!payer) {
    throw new Error('Payer not found');
  }

  const results: ProcessPayoutResult['results'] = [];
  const transactionIds: string[] = [];

  for (const item of parsed.lineItems) {
    const payee = await getPayee(item.payeeId);
    if (!payee) {
      results.push({
        payeeId: item.payeeId,
        amount: item.amount,
        status: 'failed',
        error: 'Payee not found',
      });
      continue;
    }

    const rail = payoutRailForPayee(payee);

    try {
      const amountCents = dollarsToCents(item.amount);
      const payout = await createPayout(payee.rootPayeeId, amountCents, rail, {
        ...(payer.subaccountId ? { subaccountId: payer.subaccountId } : {}),
      });

      const transactionId = randomUUID();
      await setTransaction(transactionId, {
        id: transactionId,
        payerId: parsed.payerId,
        payeeId: payee.id,
        payeeName: payee.name,
        payeeEmail: payee.email,
        amountCents,
        amount: item.amount,
        /** Snapshot at create time; list view replaces with live `GET /api/payouts/{rootPayoutId}`. */
        status: payout.status || 'initiated',
        rootPayoutId: payout.id,
        rootTransactionId: payout.id,
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      transactionIds.push(transactionId);

      results.push({
        payeeId: payee.id,
        payeeName: payee.name,
        amount: item.amount,
        status: 'success',
        rail,
        payoutId: payout.id,
        transactionId,
      });
    } catch (err) {
      results.push({
        payeeId: item.payeeId,
        amount: item.amount,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/transactions');

  return {
    success: true,
    totalAmount: parsed.totalAmount,
    payoutCount: parsed.lineItems.length,
    results,
    transactionIds,
  };
}
