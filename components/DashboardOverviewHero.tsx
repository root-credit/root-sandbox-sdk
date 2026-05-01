'use client';

import { branding } from '@/lib/branding';
import { useServiceStore } from '@/components/ServiceStoreProvider';
import { formatMoney } from '@/lib/types/payments';

/**
 * Live wallet pill on the dashboard overview. Balance is read fresh from
 * `GET /api/subaccounts/{id}` (incoming - outgoing) on every mount and after
 * any wallet-affecting mutation; nothing is cached client-side.
 */
export function DashboardOverviewHero() {
  const {
    walletEnabled,
    walletBalanceCents,
    isWalletLoading,
    postedServices,
    availableServices,
  } = useServiceStore();
  const bookedCount = postedServices.filter((s) => s.status === 'booked').length;
  const liveCount = postedServices.filter((s) => s.status === 'available').length;

  const balanceLabel =
    !walletEnabled && !isWalletLoading
      ? 'Not enabled'
      : walletBalanceCents == null
        ? '—'
        : formatMoney(walletBalanceCents);

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex flex-col justify-between rounded-2xl border-2 bg-foreground text-background px-5 py-4 sm:min-w-72">
        <span className="text-[11px] font-bold uppercase tracking-widest text-background/60">
          {branding.productName} wallet
        </span>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums">
            {isWalletLoading ? '…' : balanceLabel}
          </span>
          <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest mb-1">
            Live
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl border-2 bg-card px-5 py-4">
        <Pill label="Open marketplace" value={String(availableServices.length)} />
        <Pill label="My live shifts" value={String(liveCount)} />
        <Pill label="My booked" value={String(bookedCount)} />
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">
      <span className="font-mono tabular-nums text-foreground">{value}</span>
      <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{label}</span>
    </span>
  );
}
