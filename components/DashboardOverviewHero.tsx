'use client';

import { useCryptoStore, SPOT_PRICES } from '@/components/CryptoStoreProvider';
import { formatMoney } from '@/lib/types/payments';
import { branding } from '@/lib/branding';

/**
 * Live wallet pill on the dashboard overview.
 */
export function DashboardOverviewHero() {
  const { walletEnabled, walletBalanceCents, isWalletLoading, holdings } = useCryptoStore();

  const balanceLabel =
    !walletEnabled && !isWalletLoading
      ? 'Not enabled'
      : walletBalanceCents == null
        ? '—'
        : formatMoney(walletBalanceCents);

  const portfolioValueCents = holdings.reduce((sum, h) => {
    const price = SPOT_PRICES[h.symbol]?.priceCents ?? 0;
    return sum + Math.round(price * h.amountCrypto);
  }, 0);

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-primary/10 text-foreground px-5 py-4 sm:min-w-72">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {branding.walletName}
        </span>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums">
            {isWalletLoading ? '…' : balanceLabel}
          </span>
          <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest mb-1">
            USD
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4">
        <Pill label="Holdings" value={String(holdings.length)} />
        <Pill label="Portfolio value" value={portfolioValueCents > 0 ? formatMoney(portfolioValueCents) : '$0.00'} />
        <Pill label="Assets" value="BTC · ETH · SOL · USDC" />
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
