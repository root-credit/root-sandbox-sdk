'use server';

/**
 * Transaction (ledger) server actions.
 *
 * v0 / LLM contract:
 *   - Components MUST call these via `useTransactions` — NEVER `fetch('/api/...')`.
 *   - Transactions are read-only ledger entries written by `processPayout`.
 */

import { getCurrentSession, sessionOwnsMerchant } from '@/lib/session';
import { getMerchantTransactions } from '@/lib/redis';
import { type Transaction } from '@/lib/types/payout';

/** List all transactions for the calling merchant, newest first. */
export async function listTransactions(merchantId: string): Promise<Transaction[]> {
  const session = await getCurrentSession();
  if (!sessionOwnsMerchant(session, merchantId)) {
    throw new Error('Unauthorized');
  }
  const transactions = (await getMerchantTransactions(merchantId)) as Transaction[];
  return transactions;
}
