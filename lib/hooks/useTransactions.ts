'use client';

/**
 * useTransactions — list payout history for a merchant.
 *
 * v0 / LLM contract:
 *   - Use this hook in any client component that displays transactions.
 *   - Do NOT call `fetch('/api/payouts?merchantId=...')` directly.
 */

import { useCallback, useEffect, useState } from 'react';
import type { Transaction } from '@/lib/types/payout';
import { listTransactions } from '@/app/actions/transactions';

export function useTransactions(merchantId: string | null | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!merchantId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listTransactions(merchantId);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    if (!merchantId) return;
    refresh();
  }, [merchantId, refresh]);

  return { transactions, isLoading, error, refresh };
}
