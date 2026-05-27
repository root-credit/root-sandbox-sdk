'use client';

import { useDomainStore } from '@/components/DomainStoreProvider';
import { formatMoney } from '@/lib/types/payments';
import { branding } from '@/lib/branding';

/**
 * Live account summary on the dashboard overview. Balance is read fresh from
 * `GET /api/subaccounts/{id}` (incoming - outgoing) on every mount and after
 * any wallet-affecting mutation; nothing is cached client-side.
 */
export function DashboardOverviewHero() {
  const {
    walletEnabled,
    walletBalanceCents,
    isWalletLoading,
  } = useDomainStore();

  const balanceLabel =
    !walletEnabled && !isWalletLoading
      ? 'Not enabled'
      : walletBalanceCents == null
        ? '—'
        : formatMoney(walletBalanceCents);

  // Mocked savings for display
  const savingsBalance = '$5,200.00';
  const savingsApy = '2.00%';

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex flex-col justify-between rounded-2xl bg-primary text-primary-foreground px-5 py-4 sm:min-w-72">
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/80">
          {branding.walletName}
        </span>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums">
            {isWalletLoading ? '…' : balanceLabel}
          </span>
          <span className="rounded-full bg-background text-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest mb-1">
            Live
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl border bg-card px-5 py-4">
        <Pill label="Savings" value={savingsBalance} />
        <Pill label="APY" value={savingsApy} />
        <Pill label="Auto-Save" value="On" />
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-card border px-3 py-1.5 text-xs font-bold">
      <span className="font-mono tabular-nums text-foreground">{value}</span>
      <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{label}</span>
    </span>
  );
}
