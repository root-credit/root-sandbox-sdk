'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TrendingUp, Search, ShoppingCart, Wallet } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import type { MarketplaceDomainRecord } from '@/lib/godaddy-actions';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock crypto data to display
const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 6723450, change: '+2.4%', positive: true },
  { symbol: 'ETH', name: 'Ethereum', price: 345678, change: '+1.8%', positive: true },
  { symbol: 'SOL', name: 'Solana', price: 14256, change: '-0.5%', positive: false },
  { symbol: 'USDC', name: 'USD Coin', price: 100, change: '0.0%', positive: true },
];

export default function BuyCryptoPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const {
    walletBalanceCents,
    walletEnabled,
    marketplaceDomains,
    isDomainsLoading,
    buy,
  } = useDomainStore();
  const [query, setQuery] = useState('');
  const [busyName, setBusyName] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return marketplaceDomains;
    return marketplaceDomains.filter(
      (d) => d.name.toLowerCase().includes(q) || d.sellerHandle.toLowerCase().includes(q),
    );
  }, [marketplaceDomains, query]);

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;

  async function handleBuy(domain: MarketplaceDomainRecord) {
    if (!walletEnabled) {
      toast.error(`Set up your ${branding.walletName} before buying.`);
      return;
    }
    if (balance < domain.priceCents) {
      toast.error(
        `Insufficient balance. This asset costs ${formatMoney(domain.priceCents)}.`,
      );
      return;
    }
    if (
      !confirm(`Buy for ${formatMoney(domain.priceCents)} from your ${branding.walletName}?`)
    ) {
      return;
    }
    setBusyName(domain.id);
    try {
      const result = await buy(domain.id);
      if (result.ok) {
        toast.success(`Purchase complete. The asset is now in your holdings.`);
      } else {
        toast.error(result.reason);
      }
    } finally {
      setBusyName(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="Buy crypto" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Buy crypto</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Purchase BTC, ETH, SOL, or USDC with your {branding.walletName}. Funds move instantly.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        {/* Live prices */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Live prices
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CRYPTO_ASSETS.map((asset) => (
              <CryptoCard
                key={asset.symbol}
                symbol={asset.symbol}
                name={asset.name}
                price={formatMoney(asset.price)}
                change={asset.change}
                positive={asset.positive}
              />
            ))}
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Available to buy
          </h2>
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl bg-card font-medium border-border"
            />
          </div>
        </div>

        {isDomainsLoading ? (
          <ListingShell title="Loading assets..." body="Fetching available listings." />
        ) : filtered.length === 0 ? (
          <ListingShell
            title={
              marketplaceDomains.length === 0
                ? 'No assets available yet'
                : 'No matches'
            }
            body={
              marketplaceDomains.length === 0
                ? `As ${branding.payerPlural.toLowerCase()} list assets for sale, they'll show up here.`
                : 'Try a different search term.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <AssetCard
                key={d.id}
                domain={d}
                affordable={walletEnabled && balance >= d.priceCents}
                busy={busyName === d.id}
                onBuy={() => handleBuy(d)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Breadcrumb({ here }: { here: string }) {
  return (
    <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
      <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">
        Console
      </Link>
      <span>/</span>
      <span className="text-foreground font-bold">{here}</span>
    </nav>
  );
}

function WalletPill({
  walletBalanceCents,
  walletEnabled,
}: {
  walletBalanceCents: number | null;
  walletEnabled: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl bg-primary text-primary-foreground pl-3 pr-5 py-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-foreground/20 text-primary-foreground">
        <Wallet className="h-3.5 w-3.5" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">
          {branding.walletName}
        </span>
        <span className="text-base font-extrabold font-mono tabular-nums">
          {!walletEnabled
            ? 'Not enabled'
            : walletBalanceCents == null
              ? '—'
              : formatMoney(walletBalanceCents)}
        </span>
      </div>
    </div>
  );
}

function CryptoCard({
  symbol,
  name,
  price,
  change,
  positive,
}: {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 w-12">
          {symbol}
        </span>
        <span className={`text-xs font-bold ${positive ? 'text-accent' : 'text-destructive'}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{name}</p>
        <p className="text-xl font-extrabold font-mono tabular-nums text-foreground">{price}</p>
      </div>
    </div>
  );
}

function ListingShell({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
        <TrendingUp className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      </div>
    </div>
  );
}

function AssetCard({
  domain,
  affordable,
  busy,
  onBuy,
}: {
  domain: MarketplaceDomainRecord;
  affordable: boolean;
  busy: boolean;
  onBuy: () => void;
}) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all">
      <div className="px-5 py-5 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-2xl font-extrabold font-mono tracking-tight break-all text-foreground">
            {domain.name}
          </h3>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Listed by {domain.sellerHandle}
          </p>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 flex items-center justify-between gap-3 bg-secondary">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Buy now
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums text-foreground">
            {formatMoney(domain.priceCents)}
          </div>
        </div>
        <Button
          onClick={onBuy}
          disabled={!affordable || busy}
          className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart className="h-4 w-4" />
          {busy ? 'Buying…' : affordable ? 'Buy' : 'Add funds'}
        </Button>
      </div>
    </article>
  );
}
