'use client';

/**
 * useMerchant — read the current merchant record + link funding bank.
 *
 * v0 / LLM contract:
 *   - Use this hook for any merchant-settings UI; do NOT call `fetch('/api/merchant/...')`.
 */

import { useCallback, useEffect, useState } from 'react';
import { getCurrentMerchant, linkMerchantBank } from '@/app/actions/merchant';
import type { Merchant, LinkBankInput } from '@/lib/types/merchant';

export function useMerchant() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const m = await getCurrentMerchant();
      setMerchant(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load merchant');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { merchant, isLoading, error, refresh, setMerchant };
}

export function useLinkBank() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(merchantId: string, input: LinkBankInput) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await linkMerchantBank(merchantId, input);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to link bank';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { linkBank: submit, isSubmitting, error };
}
