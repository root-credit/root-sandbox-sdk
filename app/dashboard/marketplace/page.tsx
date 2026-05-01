'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarDays, Home, MapPin, Search, Sparkles, Wallet } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useListingStore } from '@/components/ListingStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import type { ListingRecord } from '@/lib/airbnb-actions';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function StaysPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const {
    walletBalanceCents,
    walletEnabled,
    marketplaceListings,
    isListingsLoading,
    book,
  } = useListingStore();
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return marketplaceListings;
    return marketplaceListings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.hostHandle.toLowerCase().includes(q),
    );
  }, [marketplaceListings, query]);

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;

  async function handleBook(listing: ListingRecord) {
    if (!walletEnabled) {
      toast.error(`Activate your ${branding.productName} wallet before booking.`);
      return;
    }
    if (balance < listing.totalPriceCents) {
      toast.error(
        `Insufficient wallet balance. ${listing.title} costs ${formatMoney(listing.totalPriceCents)}.`,
      );
      return;
    }
    if (
      !confirm(
        `Book ${listing.title} for ${formatMoney(listing.totalPriceCents)} from your ${branding.productName} wallet?`,
      )
    ) {
      return;
    }
    setBusyId(listing.id);
    try {
      const result = await book(listing.id);
      if (result.ok) {
        toast.success(`Booked ${listing.title}. See it under Trips.`);
      } else {
        toast.error(result.reason);
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="Stays" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Find your next stay</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              Every home is hosted by another {branding.productName} account. Book with your
              wallet — funds move host-to-guest the moment you confirm.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by city, title, or host…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 rounded-full bg-card font-medium border-2"
            />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {marketplaceListings.length} {marketplaceListings.length === 1 ? 'home' : 'homes'} live
          </span>
        </div>

        {isListingsLoading ? (
          <ListingShell title="Loading stays…" body="Fetching every active listing." />
        ) : filtered.length === 0 ? (
          <ListingShell
            title={
              marketplaceListings.length === 0
                ? 'No homes hosted yet'
                : 'No matches for that search'
            }
            body={
              marketplaceListings.length === 0
                ? 'When other accounts list their homes for rent, you\u2019ll see them here.'
                : 'Try another city or host name.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                affordable={walletEnabled && balance >= l.totalPriceCents}
                busy={busyId === l.id}
                onBook={() => handleBook(l)}
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
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Wallet className="h-4 w-4" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-widest text-background/60">
          {branding.productName} wallet
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
    <div className="rounded-3xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Home className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  affordable,
  busy,
  onBook,
}: {
  listing: ListingRecord;
  affordable: boolean;
  busy: boolean;
  onBook: () => void;
}) {
  return (
    <article className="group flex flex-col rounded-3xl bg-card overflow-hidden border hover:shadow-xl transition-all">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.imageUrl || '/placeholder.svg'}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="rounded-full bg-background/95 backdrop-blur font-bold border"
          >
            <MapPin className="h-3 w-3" />
            {listing.location}
          </Badge>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight leading-snug line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5">
            Hosted by {listing.hostHandle}
          </p>
        </div>
        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
          {listing.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>
            {formatDateShort(listing.checkIn)} – {formatDateShort(listing.checkOut)} ·{' '}
            {listing.nights} {listing.nights === 1 ? 'night' : 'nights'}
          </span>
        </div>
      </div>
      <div className="border-t px-5 py-4 flex items-center justify-between gap-3 bg-secondary/40">
        <div>
          <div className="text-xl font-extrabold font-mono tabular-nums">
            {formatMoney(listing.totalPriceCents)}
          </div>
          <div className="text-[11px] font-semibold text-muted-foreground">
            {formatMoney(listing.pricePerNightCents)} / night
          </div>
        </div>
        <Button
          onClick={onBook}
          disabled={!affordable || busy}
          className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground h-10 px-5"
        >
          {busy ? 'Booking…' : affordable ? 'Reserve' : 'Top up wallet'}
        </Button>
      </div>
    </article>
  );
}

function formatDateShort(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
