'use client';

/**
 * Tiny client islands that read the live Gusto wallet balance from the
 * `WalletProvider` context. The provider sources this from a server action
 * (`getMyWalletStatus`) which calls Root's GET /api/subaccounts/{id} —
 * nothing is cached client-side, and we re-fetch after every mutation.
 */

import { Wallet } from 'lucide-react';
import { useWallet } from '@/components/WalletProvider';
import { formatMoney } from '@/lib/types/payments';

function formatBalance(
  enabled: boolean,
  isLoading: boolean,
  cents: number | null,
): string {
  if (isLoading && cents == null) return '…';
  if (!enabled) return 'Not enabled';
  if (cents == null) return '—';
  return formatMoney(cents);
}

/**
 * Hero balance pill — shown inside the dashboard hero card.
 * Matches the existing dark "Gusto wallet" tile styling.
 */
export function WalletHeroBalance() {
  const { walletBalanceCents, walletEnabled, isWalletLoading } = useWallet();
  return (
    <div className="flex flex-col justify-between rounded-2xl border-2 bg-foreground text-background px-5 py-4 sm:min-w-72">
      <span className="text-[11px] font-bold uppercase tracking-widest text-background/60">
        Gusto wallet
      </span>
      <div className="flex items-end gap-3 mt-1">
        <span className="text-3xl md:text-4xl font-black font-mono tabular-nums">
          {formatBalance(walletEnabled, isWalletLoading, walletBalanceCents)}
        </span>
        <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest mb-1">
          Live
        </span>
      </div>
    </div>
  );
}

/** Small stat card variant used in the "At a glance" row. */
export function WalletStatCard() {
  const { walletBalanceCents, walletEnabled, isWalletLoading } = useWallet();
  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Wallet className="h-4 w-4" />
        Gusto wallet
      </div>
      <div className="text-3xl font-black font-mono tabular-nums">
        {formatBalance(walletEnabled, isWalletLoading, walletBalanceCents)}
      </div>
    </div>
  );
}
