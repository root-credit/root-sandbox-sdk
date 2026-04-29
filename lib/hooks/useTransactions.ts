'use client';

/**
 * useTransactions — list payout history for a payer.
 *
 * v0 / LLM contract:
 *   - Do NOT call `fetch('/api/payouts?payerId=...')` directly.
 */

import { useCallback, useEffect, useState } from 'react';
import { listTransactions } from '@/app/actions/transactions';
import type { Transaction } from '@/lib/types/payout';

export function useTransactions(payerId: string | null | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!payerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listTransactions(payerId);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [payerId]);

  useEffect(() => {
    if (!payerId) return;
    refresh();
  }, [payerId, refresh]);

  return { transactions, isLoading, error, refresh };
}
