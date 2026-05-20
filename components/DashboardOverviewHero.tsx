'use client';

import { useDomainStore } from '@/components/DomainStoreProvider';
import { formatMoney } from '@/lib/types/payments';

/**
 * Live wallet display on the dashboard overview. Balance is read fresh from
 * the subaccount ledger on every mount and after any wallet-affecting mutation.
 */
export function DashboardOverviewHero() {
  const {
    walletEnabled,
    walletBalanceCents,
    isWalletLoading,
  } = useDomainStore();

  const balanceLabel =
    !walletEnabled && !isWalletLoading
      ? 'Set up wallet'
      : walletBalanceCents == null
        ? '—'
        : formatMoney(walletBalanceCents);

  return (
    <div className="mt-8 rounded-2xl bg-primary text-primary-foreground p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">
            Your balance
          </span>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums">
              {isWalletLoading ? '...' : balanceLabel}
            </span>
            {walletEnabled && (
              <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-2">
                Available
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="/dashboard/payer"
            className="inline-flex items-center justify-center rounded-full bg-primary-foreground text-primary px-5 h-10 text-sm font-bold hover:bg-primary-foreground/90 transition-colors"
          >
            Add money
          </a>
          <a
            href="/dashboard/payouts"
            className="inline-flex items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground px-5 h-10 text-sm font-bold hover:bg-primary-foreground/30 transition-colors"
          >
            {walletEnabled ? 'Send' : 'Set up'}
          </a>
        </div>
      </div>
    </div>
  );
}
