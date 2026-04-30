'use client';

import { useDomainStore } from '@/components/DomainStoreProvider';
import { formatMoney } from '@/lib/types/payments';

/**
 * The hero block on the overview page surfaces a live wallet pill from the
 * client-side mock store. The four stat cards on the overview itself stay as
 * static placeholders ("0", "$0.00") per the reskin spec — only this pill
 * reflects the in-memory GAG wallet balance for the session.
 */
export function DashboardOverviewHero() {
  const { walletBalanceCents, ownedDomains, marketplaceDomains } = useDomainStore();
  const listedCount = ownedDomains.filter((d) => d.listingPriceCents !== undefined).length;

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex flex-col justify-between rounded-2xl border-2 bg-foreground text-background px-5 py-4 sm:min-w-72">
        <span className="text-[11px] font-bold uppercase tracking-widest text-background/60">
          GAG wallet
        </span>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums">
            {formatMoney(walletBalanceCents)}
          </span>
          <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest mb-1">
            Live
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl border-2 bg-card px-5 py-4">
        <Pill label="Owned" value={String(ownedDomains.length)} />
        <Pill label="Listed" value={String(listedCount)} />
        <Pill label="In marketplace" value={String(marketplaceDomains.length)} />
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
