'use client';

/**
 * usePayees — list payees for a payer.
 *
 * v0 / LLM contract:
 *   - Pass `null` for `payerId` while the session is loading; the hook will idle.
 */

import { useCallback, useEffect, useState } from 'react';
import { listPayees } from '@/app/actions/payees';
import type { Payee } from '@/lib/types/payee';

export function usePayees(payerId: string | null | undefined) {
  const [payees, setPayees] = useState<Payee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!payerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPayees(payerId);
      setPayees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payees');
    } finally {
      setIsLoading(false);
    }
  }, [payerId]);

  useEffect(() => {
    if (!payerId) return;
    refresh();
  }, [payerId, refresh]);

  return { payees, isLoading, error, refresh, setPayees };
}
