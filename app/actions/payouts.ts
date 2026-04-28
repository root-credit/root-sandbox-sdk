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
  getMerchant,
  getPayee,
  setTransaction,
} from '@/lib/redis';
import { createPayout, payoutRailForPayee } from '@/lib/root-api';
import { getCurrentSession, sessionOwnsMerchant } from '@/lib/session';
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
 * Throws if the caller is not signed in as the merchant in `input.merchantId`.
 */
export async function processPayout(
  input: ProcessPayoutInput
): Promise<ProcessPayoutResult> {
  const parsed = processPayoutInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsMerchant(session, parsed.merchantId)) {
    throw new Error('Unauthorized');
  }

  const merchant = await getMerchant(parsed.merchantId);
  if (!merchant) {
    throw new Error('Merchant not found');
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
      const payout = await createPayout(payee.rootPayeeId, amountCents, rail);

      const transactionId = randomUUID();
      await setTransaction(transactionId, {
        id: transactionId,
        merchantId: parsed.merchantId,
        payeeId: payee.id,
        payeeName: payee.name,
        payeeEmail: payee.email,
        amountCents,
        amount: item.amount,
        status: payout.status || 'completed',
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
        rail,
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
