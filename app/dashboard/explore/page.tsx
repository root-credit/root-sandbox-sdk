'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarRange, Compass, MapPin, Search, Sparkles, Wallet } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useRentalStore } from '@/components/RentalStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import type { RentalListing } from '@/lib/airbnb-actions';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COVERS: { from: string; to: string; tone: string }[] = [
  { from: 'from-rose-200', to: 'to-orange-200', tone: 'text-rose-900' },
  { from: 'from-emerald-200', to: 'to-cyan-200', tone: 'text-emerald-900' },
  { from: 'from-amber-200', to: 'to-rose-200', tone: 'text-amber-900' },
  { from: 'from-sky-200', to: 'to-indigo-200', tone: 'text-sky-900' },
  { from: 'from-fuchsia-200', to: 'to-orange-200', tone: 'text-fuchsia-900' },
  { from: 'from-teal-200', to: 'to-lime-200', tone: 'text-teal-900' },
];

export default function ExplorePage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const {
    walletBalanceCents,
    walletEnabled,
    availableListings,
    isListingsLoading,
    book,
  } = useRentalStore();
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableListings;
    return availableListings.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.hostHandle.toLowerCase().includes(q),
    );
  }, [availableListings, query]);

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;

  async function handleBook(listing: RentalListing) {
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
        `Book "${listing.title}" for ${formatMoney(listing.totalPriceCents)} from your ${branding.productName} wallet?`,
      )
    ) {
      return;
    }
    setBusyId(listing.id);
    try {
      const result = await book(listing.id);
      if (result.ok) {
        toast.success(`Booked ${listing.title}. Have a great trip.`);
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

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-10">
        <Breadcrumb here="Explore stays" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Where to next?
            </h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              Every stay is hosted by another {branding.productName.toLowerCase()}{' '}
              {branding.payerSingular.toLowerCase()}. Book with your wallet — funds settle
              instantly.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by city, place name, or host…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 h-12 rounded-full bg-card font-medium border shadow-sm"
            />
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {filtered.length} {filtered.length === 1 ? 'stay' : 'stays'} live
          </span>
        </div>

        {isListingsLoading ? (
          <ListingShell title="Looking for stays…" body="Pulling fresh listings from Redis." />
        ) : filtered.length === 0 ? (
          <ListingShell
            title={
              availableListings.length === 0
                ? 'No stays listed yet'
                : 'No matches'
            }
            body={
              availableListings.length === 0
                ? `As ${branding.payerPlural.toLowerCase()} list their homes for rent, they'll show up here.`
                : 'Try a different city or host.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => (
              <ListingCard
                key={d.id}
                listing={d}
                affordable={walletEnabled && balance >= d.totalPriceCents}
                busy={busyId === d.id}
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
    <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
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
    <div className="inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-3 pr-5 py-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Wallet className="h-3.5 w-3.5" />
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
        <Compass className="h-6 w-6 text-muted-foreground" />
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
  listing: RentalListing;
  affordable: boolean;
  busy: boolean;
  onBook: () => void;
}) {
  const cover = COVERS[(listing.coverSeed - 1) % COVERS.length];
  const initials = listing.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  return (
    <article className="group flex flex-col rounded-3xl bg-card overflow-hidden border hover:shadow-xl transition-all">
      <div
        className={`relative h-44 bg-gradient-to-br ${cover.from} ${cover.to} flex items-center justify-center`}
      >
        <span className={`text-5xl font-extrabold ${cover.tone} opacity-80`}>{initials}</span>
        <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
          {listing.nights} {listing.nights === 1 ? 'night' : 'nights'}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight leading-tight">
            {listing.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {listing.location}
          </p>
        </div>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarRange className="h-3.5 w-3.5" />
          {fmtRange(listing.startDate, listing.endDate)}
        </p>
        <p className="text-xs text-muted-foreground font-semibold">
          Hosted by {listing.hostHandle}
        </p>
      </div>
      <div className="border-t px-5 py-4 flex items-center justify-between gap-3 bg-secondary">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums">
            {formatMoney(listing.totalPriceCents)}
          </div>
        </div>
        <Button
          onClick={onBook}
          disabled={!affordable || busy}
          className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {busy ? 'Booking…' : affordable ? 'Book stay' : 'Top up wallet'}
        </Button>
      </div>
    </article>
  );
}

function fmtRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  try {
    const a = new Date(start).toLocaleDateString(undefined, opts);
    const b = new Date(end).toLocaleDateString(undefined, opts);
    return `${a} → ${b}`;
  } catch {
    return `${start} → ${end}`;
  }
}
