'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { branding } from '@/lib/branding';
import { useProcessPayout } from '@/lib/hooks/useProcessPayout';
import {
  payoutLineItemSchema,
  type PayoutLineItem,
} from '@/lib/types/payout';
import { dollarsToCents, formatMoney } from '@/lib/types/payments';
import { useWallet } from '@/components/WalletProvider';
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
  const { walletEnabled, walletBalanceCents, isWalletLoading } = useWallet();

  const totalCents = dollarsToCents(totalAmount);
  const balanceCents = walletBalanceCents ?? 0;
  const remainingCents = balanceCents - totalCents;
  const overBalance =
    walletEnabled && walletBalanceCents != null && totalCents > balanceCents;
  const walletNotReady = !walletEnabled || walletBalanceCents == null;

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

    // Hard block: never let the operator send tips for more than the
    // wallet's current Root subaccount balance.
    if (walletNotReady) {
      toast.error(`Top up your ${branding.productName} wallet before sending tips`);
      return;
    }
    if (overBalance) {
      toast.error(
        `Tip total exceeds wallet balance by ${formatMoney(totalCents - balanceCents)}`,
      );
      return;
    }

    try {
      await processPayout({ payerId, lineItems: parsed.data.lineItems, totalAmount });
      toast.success(
        `${branding.payoutVerb} — $${totalAmount.toFixed(2)} to ${parsed.data.lineItems.length} ${branding.payeeSingular.toLowerCase()}(s)`
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
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 bg-secondary p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <p className="font-extrabold">No {branding.payeePlural.toLowerCase()} yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add a {branding.payeeSingular.toLowerCase()} before you can {branding.payoutVerb.toLowerCase()}.
          </p>
        </div>
      </div>
    );
  }

  const fundedCount = Object.values(amounts).filter((v) => v > 0).length;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
          Tonight&apos;s tip pool
        </p>
        <h3 className="text-lg font-black tracking-tight mb-1">
          Enter tip amounts
        </h3>
        <p className="text-sm text-muted-foreground">
          Set tonight&apos;s tip total for each {branding.payeeSingular.toLowerCase()}. Leave blank to skip.
        </p>

        <div className="mt-4 rounded-xl border-2 overflow-hidden bg-card">
          {payees.map((payee, idx) => (
            <div
              key={payee.id}
              className={`flex items-center gap-4 px-4 py-3 ${
                idx !== payees.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-foreground text-xs font-black flex-none">
                  {payee.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </span>
                <span className="font-bold truncate text-sm">{payee.name}</span>
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

      <div
        className={`rounded-xl border-2 p-5 transition-colors ${
          overBalance
            ? 'bg-destructive/10 border-destructive/40'
            : 'bg-primary/10 border-primary/40'
        }`}
      >
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Total tip pool
            </p>
            <div className="text-4xl font-black font-mono mt-1 tracking-tight tabular-nums">
              ${totalAmount.toFixed(2)}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground font-semibold">
              {fundedCount} of {payees.length} {branding.payeePlural.toLowerCase()} · settles via Root rails
            </p>
          </div>
          <Button
            type="submit"
            disabled={
              isProcessing ||
              totalAmount <= 0 ||
              overBalance ||
              walletNotReady ||
              isWalletLoading
            }
            className="shrink-0 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Settling…
              </>
            ) : (
              branding.payoutVerb
            )}
          </Button>
        </div>

        {/* Wallet balance read-out */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-card border-2 px-3 py-2">
            <p className="font-bold uppercase tracking-widest text-muted-foreground">
              Wallet balance
            </p>
            <p className="font-mono font-black tabular-nums mt-0.5 text-sm">
              {walletNotReady
                ? '—'
                : formatMoney(walletBalanceCents ?? 0)}
            </p>
          </div>
          <div
            className={`rounded-lg border-2 px-3 py-2 ${
              overBalance ? 'bg-destructive/10 border-destructive/40' : 'bg-card'
            }`}
          >
            <p className="font-bold uppercase tracking-widest text-muted-foreground">
              {overBalance ? 'Short by' : 'Remaining after run'}
            </p>
            <p
              className={`font-mono font-black tabular-nums mt-0.5 text-sm ${
                overBalance ? 'text-destructive' : ''
              }`}
            >
              {walletNotReady
                ? '—'
                : overBalance
                  ? formatMoney(totalCents - balanceCents)
                  : formatMoney(remainingCents)}
            </p>
          </div>
        </div>

        {overBalance && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-destructive/15 border-2 border-destructive/30 px-3 py-2.5 text-xs font-bold text-destructive">
            <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
            <span className="leading-snug">
              This tip-out is more than your wallet balance. Top up the wallet
              or lower the totals before sending tips.
            </span>
          </div>
        )}

        {walletNotReady && !isWalletLoading && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-secondary border-2 px-3 py-2.5 text-xs font-bold">
            <AlertTriangle className="h-4 w-4 flex-none mt-0.5 text-primary" />
            <span className="leading-snug">
              Your {branding.productName} wallet isn&apos;t funded yet. Top it
              up from Wallet & bank to enable tip payouts.
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Tip payouts are processed immediately via Root&apos;s payment infrastructure.
      </p>
    </form>
  );
}
