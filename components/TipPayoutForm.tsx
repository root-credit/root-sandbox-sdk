'use client';

import { useState } from 'react';
import { z } from 'zod';

/** Tip rows sent to /api/payouts — amounts are dollars (API converts to cents). */
const tipPayoutSchema = z.object({
  tips: z
    .array(
      z.object({
        workerId: z.string(),
        amount: z.number().min(0.01, 'Amount must be greater than 0'),
      })
    )
    .min(1, 'At least one worker must have a tip amount'),
});

interface Worker {
  id: string;
  name: string;
}

interface TipPayoutFormProps {
  restaurantId: string;
  workers: Worker[];
  onSuccess?: () => void;
}

export function TipPayoutForm({ restaurantId, workers, onSuccess }: TipPayoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  /** Sum of tip amounts in dollars */
  const [totalAmount, setTotalAmount] = useState(0);
  const [tipAmounts, setTipAmounts] = useState<Record<string, number>>({});

  const handleTipAmountChange = (workerId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const newAmounts = { ...tipAmounts, [workerId]: numAmount };
    setTipAmounts(newAmounts);

    const total = Object.values(newAmounts).reduce((sum, val) => sum + val, 0);
    setTotalAmount(total);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const tips = workers
        .map((worker) => ({
          workerId: worker.id,
          amount: tipAmounts[worker.id] || 0,
        }))
        .filter((tip) => tip.amount > 0);

      const parsed = tipPayoutSchema.safeParse({ tips });
      if (!parsed.success) {
        const msg =
          parsed.error.flatten().fieldErrors.tips?.[0] ??
          'Enter at least one tip greater than $0';
        throw new Error(msg);
      }

      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tips: parsed.data.tips,
          totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payouts');
      }

      await response.json();
      setSuccess(
        `Successfully paid out $${totalAmount.toFixed(2)} to ${parsed.data.tips.length} worker(s)!`
      );
      setTipAmounts({});
      setTotalAmount(0);

      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  if (workers.length === 0) {
    return (
      <div className="p-10 bg-neutral-100 border border-neutral-200 rounded-lg text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface text-neutral-400 mb-4 border border-neutral-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <h3 className="font-display text-xl tracking-tightest text-ink">No workers yet</h3>
        <p className="text-sm text-neutral-500 mt-1.5">
          Add workers before you can process a tip-out.
        </p>
      </div>
    );
  }

  const fundedCount = Object.values(tipAmounts).filter((v) => v > 0).length;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-error-soft border border-error/20 rounded-md text-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 bg-success-soft border border-success/20 rounded-md text-success text-sm">
          {success}
        </div>
      )}

      <div>
        <p className="text-eyebrow mb-1">Tip-out</p>
        <h3 className="font-display text-xl tracking-tightest mb-1.5">
          Enter end-of-shift amounts
        </h3>
        <p className="text-sm text-neutral-500">
          Enter the tip amount for each worker. Leave blank to skip.
        </p>

        <div className="mt-5 rounded-lg border border-neutral-200 overflow-hidden bg-surface">
          {workers.map((worker, idx) => (
            <div
              key={worker.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                idx !== workers.length - 1 ? 'border-b border-neutral-150' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium flex-none">
                  {worker.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </span>
                <span className="font-medium truncate">{worker.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-mono-tab text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={tipAmounts[worker.id] || ''}
                  onChange={(e) => handleTipAmountChange(worker.id, e.target.value)}
                  className="w-28 px-3 py-2 text-right font-mono-tab text-sm bg-surface text-foreground rounded-md border border-neutral-200 placeholder:text-neutral-300 focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-bright/25 transition-smooth"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total summary card */}
      <div className="relative overflow-hidden rounded-lg border border-ink bg-ink text-white p-6">
        <div
          aria-hidden
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,160,23,0.35), transparent 70%)',
          }}
        />
        <div className="relative flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/55">
              Tonight&apos;s total payout
            </p>
            <div className="font-display text-4xl mt-1.5 tracking-tightest">
              <span className="text-white/40">$</span>
              <span className="text-gold-bright">{totalAmount.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-white/55">
              {fundedCount} of {workers.length} workers · settles via Root rails
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || totalAmount <= 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-white text-ink text-sm font-medium tracking-tight hover:bg-gold-soft transition-smooth disabled:opacity-40 disabled:cursor-not-allowed shadow-md-custom"
          >
            {isLoading ? (
              <>
                <Spinner /> Settling…
              </>
            ) : (
              <>
                Process payouts
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Tips are processed immediately via Root&apos;s payment infrastructure.
      </p>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
