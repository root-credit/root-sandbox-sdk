'use client';

/**
 * useCreatePayee — onboard a new payee + payment method.
 *
 * v0 / LLM contract:
 *   - Use this hook in any add-payee form. Do NOT call `fetch('/api/payees')` directly.
 *   - Submit the form with `createPayeeInputSchema`-shaped data; server re-validates.
 */

import { useState } from 'react';
import { createPayee, removePayee } from '@/app/actions/payees';
import type { CreatePayeeInput } from '@/lib/types/payee';

export function useCreatePayee() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(merchantId: string, input: CreatePayeeInput) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createPayee(merchantId, input);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add payee';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { createPayee: submit, isSubmitting, error };
}

export function useRemovePayee() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(merchantId: string, payeeId: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await removePayee(merchantId, { payeeId });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove payee';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { removePayee: submit, isSubmitting, error };
}
