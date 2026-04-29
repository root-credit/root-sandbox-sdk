'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { branding } from '@/lib/branding';
import { useProcessPayout } from '@/lib/hooks/useProcessPayout';
import {
  payoutLineItemSchema,
  type PayoutLineItem,
} from '@/lib/types/payout';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const localBatchSchema = z.object({
  lineItems: z.array(payoutLineItemSchema).min(1, 'Add at least one amount'),
});

interface Payee {
  id: string;
  name: string;
}

interface PayoutFormProps {
  payerId: string;
  payees: Payee[];
  onSuccess?: () => void;
}

export function PayoutForm({ payerId, payees, onSuccess }: PayoutFormProps) {
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

    const lineItems: PayoutLineItem[] = payees
      .map((p) => ({ payeeId: p.id, amount: amounts[p.id] || 0 }))
      .filter((row) => row.amount > 0);

    const parsed = localBatchSchema.safeParse({ lineItems });
    if (!parsed.success) {
      toast.error(
        parsed.error.flatten().fieldErrors.lineItems?.[0] ??
          'Enter at least one amount greater than $0'
      );
      return;
    }

    try {
      await processPayout({ payerId, lineItems: parsed.data.lineItems, totalAmount });
      toast.success(
        `Paid out $${totalAmount.toFixed(2)} to ${parsed.data.lineItems.length} ${branding.payeeSingular.toLowerCase()}(s)`
      );
      setAmounts({});
      setTotalAmount(0);
      if (onSuccess) setTimeout(onSuccess, 800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  if (payees.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <p className="font-medium">No {branding.payeePlural.toLowerCase()} yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add {branding.payeePlural.toLowerCase()} before you can process a {branding.payoutNoun.toLowerCase()}.
          </p>
        </div>
      </div>
    );
  }

  const fundedCount = Object.values(amounts).filter((v) => v > 0).length;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{branding.payoutNoun}</p>
        <h3 className="font-semibold tracking-tight mb-1">Enter end-of-shift amounts</h3>
        <p className="text-sm text-muted-foreground">
          Enter the amount for each {branding.payeeSingular.toLowerCase()}. Leave blank to skip.
        </p>

        <div className="mt-4 rounded-lg border overflow-hidden bg-card">
          {payees.map((payee, idx) => (
            <div
              key={payee.id}
              className={`flex items-center gap-4 px-4 py-3 ${
                idx !== payees.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-medium flex-none">
                  {payee.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </span>
                <span className="font-medium truncate text-sm">{payee.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amounts[payee.id] || ''}
                  onChange={(e) => handleAmountChange(payee.id, e.target.value)}
                  className="w-28 text-right font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-primary/5 border-primary/20 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tonight&apos;s total payout</p>
            <div className="text-3xl font-semibold font-mono mt-1 tracking-tight">
              ${totalAmount.toFixed(2)}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {fundedCount} of {payees.length} {branding.payeePlural.toLowerCase()} · settles via Root rails
            </p>
          </div>
          <Button
            type="submit"
            disabled={isProcessing || totalAmount <= 0}
            className="shrink-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Settling…
              </>
            ) : (
              'Process payouts'
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Payouts are processed immediately via Root&apos;s payment infrastructure.
      </p>
    </form>
  );
}
