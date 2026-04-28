'use client';

/**
 * useProcessPayout — submit a batch of payouts.
 *
 * v0 / LLM contract:
 *   - Use this hook to call the `processPayout` server action; do NOT `fetch('/api/payouts')`.
 *   - Inputs are validated server-side against `processPayoutInputSchema`.
 *   - Returned `result.results` is per-line; render success/failure per row.
 */

import { useState } from 'react';
import { processPayout } from '@/app/actions/payouts';
import type {
  ProcessPayoutInput,
  ProcessPayoutResult,
} from '@/lib/types/payout';

export function useProcessPayout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ProcessPayoutResult | null>(null);

  async function submit(input: ProcessPayoutInput): Promise<ProcessPayoutResult> {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await processPayout(input);
      setLastResult(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to process payouts';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }

  return { processPayout: submit, isProcessing, error, lastResult };
}
