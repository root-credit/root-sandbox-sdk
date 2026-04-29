'use server';

/**
 * Transaction listing server action.
 */

import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';
import { getPayerTransactions } from '@/lib/redis';
import type { Transaction } from '@/lib/types/payout';

/** List all transactions for the calling payer, newest first. */
export async function listTransactions(payerId: string): Promise<Transaction[]> {
  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }
  const transactions = (await getPayerTransactions(payerId)) as Transaction[];
  return transactions;
}
