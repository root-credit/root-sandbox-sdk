'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, Search, Calendar, Wallet, MapPin, Star, Home } from 'lucide-react';
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
      (d) => 
        d.name.toLowerCase().includes(q) || 
        d.sellerHandle.toLowerCase().includes(q) ||
        (d.location && d.location.toLowerCase().includes(q)),
    );
  }, [marketplaceDomains, query]);

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;

  async function handleBook(property: MarketplaceDomainRecord) {
    if (!walletEnabled) {
      toast.error(`Set up your ${branding.walletName} before booking.`);
      return;
    }
    if (balance < property.priceCents) {
      toast.error(
        `Insufficient ${branding.walletName} balance. This stay costs ${formatMoney(property.priceCents)}.`,
      );
      return;
    }
    if (
      !confirm(`Book "${property.name}" for ${formatMoney(property.priceCents)} from your ${branding.walletName}?`)
    ) {
      return;
    }
    setBusyName(property.id);
    try {
      const result = await buy(property.id);
      if (result.ok) {
        toast.success(`Booking confirmed! "${property.name}" is now yours.`);
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
        <Breadcrumb here="Explore" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Explore stays</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Discover unique properties listed by hosts. Book instantly with your {branding.walletName}.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, location, or host..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 rounded-full bg-card font-medium"
            />
          </div>
        </div>

        {isDomainsLoading ? (
          <ListingShell title="Loading properties..." body="Fetching available listings." />
        ) : filtered.length === 0 ? (
          <ListingShell
            title={
              marketplaceDomains.length === 0
                ? 'No properties available yet'
                : 'No matches found'
            }
            body={
              marketplaceDomains.length === 0
                ? 'When hosts list their properties, they will appear here for booking.'
                : 'Try adjusting your search terms.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <PropertyCard
                key={d.id}
                property={d}
                affordable={walletEnabled && balance >= d.priceCents}
                busy={busyName === d.id}
                onBook={() => handleBook(d)}
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
      <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
        Dashboard
      </Link>
      <span>/</span>
      <span className="text-foreground font-semibold">{here}</span>
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
    <div className="inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground pl-3 pr-5 py-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20">
        <Wallet className="h-3.5 w-3.5" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/70">
          {branding.walletName}
        </span>
        <span className="text-base font-bold font-mono tabular-nums">
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
    <div className="rounded-2xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-bold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      </div>
    </div>
  );
}

function PropertyCard({
  property,
  affordable,
  busy,
  onBook,
}: {
  property: MarketplaceDomainRecord;
  affordable: boolean;
  busy: boolean;
  onBook: () => void;
}) {
  return (
    <article className="group flex flex-col rounded-3xl border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
      {/* Property image placeholder */}
      <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
        <Home className="h-12 w-12 text-muted-foreground/30" />
      </div>
      
      <div className="px-5 py-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-tight truncate">
              {property.name}
            </h3>
            {property.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {property.location}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">4.9</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Hosted by {property.sellerHandle}
        </p>
      </div>
      
      <div className="border-t px-5 py-4 flex items-center justify-between gap-3 bg-secondary/50">
        <div>
          <div className="text-xl font-bold font-mono tabular-nums">
            {formatMoney(property.priceCents)}
          </div>
          <div className="text-xs text-muted-foreground">per night</div>
        </div>
        <Button
          onClick={onBook}
          disabled={!affordable || busy}
          className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          <Calendar className="h-4 w-4" />
          {busy ? 'Booking...' : affordable ? 'Book now' : 'Top up wallet'}
        </Button>
      </div>
    </article>
  );
}
