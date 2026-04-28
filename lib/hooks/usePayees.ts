'use client';

/**
 * usePayees — list payees for a merchant.
 *
 * v0 / LLM contract:
 *   - Use this hook in any client component that lists payees.
 *   - Do NOT call `fetch('/api/payees')` directly.
 *   - Pass `null` for `merchantId` while the session is loading; the hook will idle.
 */

import { useCallback, useEffect, useState } from 'react';
import type { Payee } from '@/lib/types/payee';
import { listPayees } from '@/app/actions/payees';

export function usePayees(merchantId: string | null | undefined) {
  const [payees, setPayees] = useState<Payee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!merchantId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPayees(merchantId);
      setPayees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payees');
    } finally {
      setIsLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    if (!merchantId) return;
    refresh();
  }, [merchantId, refresh]);

  return { payees, isLoading, error, refresh, setPayees };
}
