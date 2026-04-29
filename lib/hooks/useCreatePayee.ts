'use client';

/**
 * useCreatePayee / useRemovePayee — mutate payee roster via server actions.
 */

import { useState } from 'react';
import { createPayee, removePayee } from '@/app/actions/payees';
import type { CreatePayeeInput } from '@/lib/types/payee';

export function useCreatePayee() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payerId: string, input: CreatePayeeInput) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createPayee(payerId, input);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create payee';
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

  async function submit(payerId: string, payeeId: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await removePayee(payerId, { payeeId });
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
