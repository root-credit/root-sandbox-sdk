'use client';

/**
 * usePayer — read the current payer record + link funding bank.
 *
 * v0 / LLM contract:
 *   - Use this hook for any payer-settings UI; do NOT call `fetch('/api/payer/...')`.
 */

import { useCallback, useState } from 'react';
import {
  clearPayerSubaccount,
  createPayerSubaccount,
  fundPayerSubaccountPayin,
  getCurrentPayer,
  linkPayerBank,
} from '@/app/actions/payer';
import type { FundSubaccountPayinInput } from '@/lib/types/fund';
import type { Payer, LinkBankInput } from '@/lib/types/payer';

export function usePayer() {
  const [payer, setPayer] = useState<Payer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const p = await getCurrentPayer();
      setPayer(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payer');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { payer, isLoading, error, refresh, setPayer };
}

export function useLinkBank() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payerId: string, input: LinkBankInput) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await linkPayerBank(payerId, input);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to link bank account';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { linkBank: submit, isSubmitting, error };
}

export function usePayerSubaccountToggle() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function enableSubaccount(payerId: string, subaccountDisplayName: string) {
    setIsSubmitting(true);
    try {
      const result = await createPayerSubaccount(payerId, {
        name: subaccountDisplayName,
      });
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function disableSubaccount(payerId: string) {
    setIsSubmitting(true);
    try {
      return await clearPayerSubaccount(payerId);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { enableSubaccount, disableSubaccount, isSubmitting };
}

export function useFundSubaccountPayin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payerId: string, input: FundSubaccountPayinInput) {
    setIsSubmitting(true);
    setError(null);
    try {
      return await fundPayerSubaccountPayin(payerId, input);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create payin';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { fundPayin: submit, isSubmitting, error };
}
