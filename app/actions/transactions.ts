'use server';

/**
 * Transaction listing server action.
 *
 * Ledger rows live in Redis (`rootPayoutId` is the Root payout id from `POST /api/payouts/`).
 * Status is hydrated per row via `GET /api/payouts/{id}` so the UI reflects settlement on Root,
 * not only the status captured at creation time.
 */

import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';
import { getPayerTransactions } from '@/lib/redis';
import { getPayoutStatus } from '@/lib/root-api';
import type { Transaction } from '@/lib/types/payout';

/** List all transactions for the calling payer, newest first, with live payout status from Root. */
export async function listTransactions(payerId: string): Promise<Transaction[]> {
  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }
  const transactions = (await getPayerTransactions(payerId)) as Transaction[];

  const hydrated = await Promise.all(
    transactions.map(async (t) => {
      const payoutId = t.rootPayoutId?.trim();
      if (!payoutId) return t;
      try {
        const remote = await getPayoutStatus(payoutId);
        return {
          ...t,
          status: remote.status,
        };
      } catch {
        return t;
      }
    }),
  );

  return hydrated.sort((a, b) => b.createdAt - a.createdAt);
}
