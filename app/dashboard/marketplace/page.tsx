'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Globe2, Search, ShoppingCart, Wallet } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import type { MarketplaceDomainRecord } from '@/lib/godaddy-actions';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MarketplacePage() {
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
      toast.error('Set up your GAG wallet before buying.');
      return;
    }
    if (balance < domain.priceCents) {
      toast.error(
        `Insufficient wallet balance. ${domain.name} costs ${formatMoney(domain.priceCents)}.`,
      );
      return;
    }
    if (
      !confirm(`Buy ${domain.name} for ${formatMoney(domain.priceCents)} from your GAG wallet?`)
    ) {
      return;
    }
    setBusyName(domain.id);
    try {
      const result = await buy(domain.id);
      if (result.ok) {
        toast.success(`Acquired ${domain.name}. It's now in My domains.`);
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
        <Breadcrumb here="Marketplace" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Marketplace</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Browse domains listed for sale by other {branding.payerPlural.toLowerCase()}. Buy
              with your GAG wallet — funds move instantly.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search domains or sellers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 rounded-full bg-card font-medium"
            />
          </div>
        </div>

        {isDomainsLoading ? (
          <ListingShell title="Loading marketplace…" body="Fetching active listings from Redis." />
        ) : filtered.length === 0 ? (
          <ListingShell
            title={
              marketplaceDomains.length === 0
                ? 'No domains listed yet'
                : 'No matches'
            }
            body={
              marketplaceDomains.length === 0
                ? `As ${branding.payerPlural.toLowerCase()} transfer in domains and list them, they'll show up here.`
                : 'Try a different search term.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <DomainCard
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
    <div className="inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-3 pr-5 py-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Wallet className="h-3.5 w-3.5" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-widest text-background/60">
          GAG wallet
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

function ListingShell({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Globe2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      </div>
    </div>
  );
}

function DomainCard({
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
    <article className="group flex flex-col rounded-2xl border-2 bg-card overflow-hidden hover:border-foreground hover:shadow-lg transition-all">
      <div className="px-5 py-5 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-2xl font-extrabold font-mono tracking-tight break-all">
            {domain.name}
          </h3>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Sold by {domain.sellerHandle}
          </p>
        </div>
      </div>
      <div className="border-t-2 px-5 py-4 flex items-center justify-between gap-3 bg-secondary">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Buy now
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums">
            {formatMoney(domain.priceCents)}
          </div>
        </div>
        <Button
          onClick={onBuy}
          disabled={!affordable || busy}
          className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart className="h-4 w-4" />
          {busy ? 'Buying…' : affordable ? 'Buy' : 'Top up wallet'}
        </Button>
      </div>
    </article>
  );
}
