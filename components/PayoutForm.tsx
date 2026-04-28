'use client';

import { useState } from 'react';
import { branding } from '@/lib/branding';
import { useProcessPayout } from '@/lib/hooks/useProcessPayout';
import {
  payoutLineItemSchema,
  type PayoutLineItem,
} from '@/lib/types/payout';
import { z } from 'zod';

/** Local UI-only schema: ensures at least one funded line item before we hit the action. */
const localBatchSchema = z.object({
  lineItems: z.array(payoutLineItemSchema).min(1, 'Add at least one amount'),
});

interface Payee {
  id: string;
  name: string;
}

interface PayoutFormProps {
  merchantId: string;
  payees: Payee[];
  onSuccess?: () => void;
}

export function PayoutForm({ merchantId, payees, onSuccess }: PayoutFormProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const { processPayout, isProcessing } = useProcessPayout();

  const handleAmountChange = (payeeId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const next = { ...amounts, [payeeId]: numAmount };
    setAmounts(next);
    const total = Object.values(next).reduce((sum, val) => sum + val, 0);
    setTotalAmount(total);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const lineItems: PayoutLineItem[] = payees
      .map((p) => ({ payeeId: p.id, amount: amounts[p.id] || 0 }))
      .filter((row) => row.amount > 0);

    const parsed = localBatchSchema.safeParse({ lineItems });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.lineItems?.[0] ??
          'Enter at least one amount greater than $0'
      );
      return;
    }

    try {
      await processPayout({
        merchantId,
        lineItems: parsed.data.lineItems,
        totalAmount,
      });
      setSuccess(
        `Successfully paid out $${totalAmount.toFixed(2)} to ${parsed.data.lineItems.length} ${branding.payeeSingular.toLowerCase()}(s)!`
      );
      setAmounts({});
      setTotalAmount(0);
      if (onSuccess) setTimeout(onSuccess, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  if (payees.length === 0) {
    return (
      <div className="p-10 bg-neutral-100 border border-neutral-200 rounded-lg text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface text-neutral-400 mb-4 border border-neutral-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <h3 className="font-display text-xl tracking-tightest text-ink">
          No {branding.payeePlural.toLowerCase()} yet
        </h3>
        <p className="text-sm text-neutral-500 mt-1.5">
          Add {branding.payeePlural.toLowerCase()} before you can process a {branding.payoutNoun.toLowerCase()}.
        </p>
      </div>
    );
  }

  const fundedCount = Object.values(amounts).filter((v) => v > 0).length;

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
        <p className="text-eyebrow mb-1">{branding.payoutNoun}</p>
        <h3 className="font-display text-xl tracking-tightest mb-1.5">
          Enter end-of-shift amounts
        </h3>
        <p className="text-sm text-neutral-500">
          Enter the amount for each {branding.payeeSingular.toLowerCase()}. Leave blank to skip.
        </p>

        <div className="mt-5 rounded-lg border border-neutral-200 overflow-hidden bg-surface">
          {payees.map((payee, idx) => (
            <div
              key={payee.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                idx !== payees.length - 1 ? 'border-b border-neutral-150' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium flex-none">
                  {payee.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </span>
                <span className="font-medium truncate">{payee.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-mono-tab text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amounts[payee.id] || ''}
                  onChange={(e) => handleAmountChange(payee.id, e.target.value)}
                  className="w-28 px-3 py-2 text-right font-mono-tab text-sm bg-surface text-foreground rounded-md border border-neutral-200 placeholder:text-neutral-300 focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-bright/25 transition-smooth"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

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
              {fundedCount} of {payees.length} {branding.payeePlural.toLowerCase()} · settles via Root rails
            </p>
          </div>
          <button
            type="submit"
            disabled={isProcessing || totalAmount <= 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-white text-ink text-sm font-medium tracking-tight hover:bg-gold-soft transition-smooth disabled:opacity-40 disabled:cursor-not-allowed shadow-md-custom"
          >
            {isProcessing ? (
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
        Payouts are processed immediately via Root&apos;s payment infrastructure.
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
