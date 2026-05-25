'use client';

import { useDomainStore } from '@/components/DomainStoreProvider';
import { branding } from '@/lib/branding';
import { formatMoney } from '@/lib/types/payments';

/**
 * Live wallet display on the dashboard overview. Balance is read fresh from
 * the Root subaccount on every mount and after any wallet-affecting mutation.
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

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex flex-col justify-between rounded-lg bg-primary text-primary-foreground px-5 py-4 sm:min-w-64">
        <span className="text-xs font-medium text-primary-foreground/70">
          {branding.walletName}
        </span>
        <div className="flex items-end gap-3 mt-2">
          <span className="text-3xl md:text-4xl font-bold font-mono tabular-nums">
            {isWalletLoading ? '...' : balanceLabel}
          </span>
          {walletEnabled && (
            <span className="rounded-full bg-background/20 text-primary-foreground px-2.5 py-1 text-[10px] font-medium mb-1">
              USD
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-5 py-4">
        <Pill label="Available to send" value={walletEnabled ? formatMoney(walletBalanceCents ?? 0) : '—'} />
        <Pill label={branding.payeePlural} value="0" />
        <Pill label={branding.payoutNounPlural} value="0" />
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-medium">
      <span className="font-mono tabular-nums text-foreground">{value}</span>
      <span className="text-muted-foreground text-[10px]">{label}</span>
    </span>
  );
}
