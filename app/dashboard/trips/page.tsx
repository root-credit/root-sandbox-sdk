'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, MapPin, Plane, Search } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useListingStore } from '@/components/ListingStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { formatMoney } from '@/lib/types/payments';
import type { ListingRecord } from '@/lib/airbnb-actions';
import { Badge } from '@/components/ui/badge';

export default function TripsPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { trips, isListingsLoading } = useListingStore();

  if (!session) return null;

  const totalSpentCents = trips.reduce((sum, t) => sum + t.totalPriceCents, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="Trips" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Your trips</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              Every stay you&apos;ve booked, with check-in details and the total you paid from
              your {branding.productName} wallet.
            </p>
          </div>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background h-12 px-6 text-sm font-bold hover:bg-foreground/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Find another stay
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Trips booked" value={String(trips.length)} />
          <StatCard label="Total spent" value={formatMoney(totalSpentCents)} mono />
          <StatCard
            label="Nights stayed"
            value={String(trips.reduce((sum, t) => sum + t.nights, 0))}
          />
        </div>

        {isListingsLoading ? (
          <LoadingShell />
        ) : trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {trips.map((t) => (
              <TripCard key={t.id} trip={t} />
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

function StatCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={`text-2xl font-extrabold tabular-nums ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function TripCard({ trip }: { trip: ListingRecord }) {
  const upcoming = trip.checkIn >= new Date().toISOString().slice(0, 10);
  return (
    <article className="rounded-3xl bg-card border overflow-hidden hover:shadow-md transition-all">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.imageUrl || '/placeholder.svg'}
          alt={trip.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant={upcoming ? 'success' : 'secondary'}
            className="rounded-full font-bold"
          >
            {upcoming ? 'Upcoming' : 'Completed'}
          </Badge>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight leading-snug">{trip.title}</h3>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5 flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {trip.location} · Hosted by {trip.hostHandle}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {formatDateShort(trip.checkIn)} – {formatDateShort(trip.checkOut)} ·{' '}
              {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-base font-extrabold font-mono tabular-nums">
              {formatMoney(trip.totalPriceCents)}
            </div>
            <div className="text-[10px] font-semibold text-muted-foreground">paid</div>
          </div>
        </div>
        {trip.bookedAt && (
          <p className="text-[11px] text-muted-foreground font-mono">
            Booked {new Date(trip.bookedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </article>
  );
}

function LoadingShell() {
  return (
    <div className="rounded-3xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Plane className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Loading your trips…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Plane className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">No trips booked yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Browse stays and reserve a home using your wallet balance.
        </p>
      </div>
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground h-11 px-5 text-sm font-bold hover:bg-primary/90 transition-colors"
      >
        <Search className="h-4 w-4" />
        Find a stay
      </Link>
    </div>
  );
}

function formatDateShort(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
