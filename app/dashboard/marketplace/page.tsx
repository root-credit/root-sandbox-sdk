'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Globe2, Search, ShoppingCart, Sparkles, Wallet } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import {
  categoryLabels,
  type DomainCategory,
  type MarketplaceDomain,
} from '@/lib/godaddy-mock-data';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ALL_CATEGORIES: (DomainCategory | 'all')[] = [
  'all',
  'tech',
  'business',
  'creative',
  'finance',
  'lifestyle',
];

export default function MarketplacePage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { walletBalanceCents, marketplaceDomains, buyDomain } = useDomainStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DomainCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return marketplaceDomains.filter((d) => {
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.sellerHandle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [marketplaceDomains, activeCategory, query]);

  if (!session) return null;

  function handleBuy(domain: MarketplaceDomain) {
    if (walletBalanceCents < domain.priceCents) {
      toast.error(
        `Insufficient wallet balance. ${domain.name} costs ${formatMoney(domain.priceCents)}.`,
      );
      return;
    }
    if (!confirm(`Buy ${domain.name} for ${formatMoney(domain.priceCents)} from your GAG wallet?`)) {
      return;
    }
    const result = buyDomain(domain.id);
    if (result.ok) {
      toast.success(`Acquired ${domain.name}. It's now in My domains.`);
    } else {
      toast.error(result.reason);
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
              Browse domains listed for sale by other {branding.payerPlural.toLowerCase()}. Buy with
              your GAG wallet — funds move instantly.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search domains, sellers, descriptions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 rounded-full bg-card font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const label = cat === 'all' ? 'All categories' : categoryLabels[cat];
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-2 transition-colors',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-foreground hover:border-foreground',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Globe2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-extrabold">No matches</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different category or clear your search.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <DomainCard
                key={d.id}
                domain={d}
                affordable={walletBalanceCents >= d.priceCents}
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

function WalletPill({ walletBalanceCents }: { walletBalanceCents: number }) {
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
          {formatMoney(walletBalanceCents)}
        </span>
      </div>
    </div>
  );
}

function DomainCard({
  domain,
  affordable,
  onBuy,
}: {
  domain: MarketplaceDomain;
  affordable: boolean;
  onBuy: () => void;
}) {
  return (
    <article className="group flex flex-col rounded-2xl border-2 bg-card overflow-hidden hover:border-foreground hover:shadow-lg transition-all">
      <div className="bg-primary/10 px-5 py-4 flex items-center justify-between">
        <span className="inline-flex items-center justify-center rounded-md bg-primary/20 text-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
          {categoryLabels[domain.category]}
        </span>
        {domain.trafficScore >= 80 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
            <Sparkles className="h-3 w-3" />
            Premium
          </span>
        )}
      </div>
      <div className="px-5 py-5 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-2xl font-extrabold font-mono tracking-tight break-all">
            {domain.name}
          </h3>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Sold by {domain.sellerHandle}
          </p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {domain.description}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-widest text-muted-foreground">
            Traffic score
          </span>
          <span className="font-mono font-bold tabular-nums">{domain.trafficScore}/100</span>
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
          disabled={!affordable}
          className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart className="h-4 w-4" />
          {affordable ? 'Buy' : 'Top up wallet'}
        </Button>
      </div>
      {!affordable && (
        <Badge variant="warning" className="absolute top-3 right-3 hidden">
          Insufficient
        </Badge>
      )}
    </article>
  );
}
