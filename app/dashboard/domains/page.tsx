'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CalendarDays,
  CheckCircle2,
  Home,
  Lock,
  MapPin,
  Plus,
  X,
} from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useListingStore } from '@/components/ListingStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { formatMoney } from '@/lib/types/payments';
import type { ListingRecord } from '@/lib/airbnb-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function HostingPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { hostedListings, isListingsLoading, createListing, unlist } = useListingStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  if (!session) return null;

  const available = hostedListings.filter((l) => l.status === 'available');
  const booked = hostedListings.filter((l) => l.status === 'booked');
  const grossEarningsCents = booked.reduce((sum, l) => sum + l.totalPriceCents, 0);

  function resetForm() {
    setTitle('');
    setLocation('');
    setDescription('');
    setPricePerNight('');
    setCheckIn('');
    setCheckOut('');
  }

  async function handleCreate() {
    if (busy) return;
    const price = parseFloat(pricePerNight);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Enter a valid nightly price.');
      return;
    }
    setBusy(true);
    try {
      const result = await createListing({
        title,
        location,
        description,
        pricePerNightDollars: price,
        checkIn,
        checkOut,
      });
      if (result.ok) {
        toast.success(`Listed ${result.listing?.title}. Guests can book now.`);
        setCreateOpen(false);
        resetForm();
      } else {
        toast.error(result.reason);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlist(listing: ListingRecord) {
    if (!confirm(`Remove "${listing.title}" from the marketplace?`)) return;
    const result = await unlist(listing.id);
    if (result.ok) {
      toast.success(`Removed ${listing.title}.`);
    } else {
      toast.error(result.reason);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="Hosting" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Your hosting</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              Open your space to guests for a specific window. Once another account books your
              listing, funds settle into your {branding.productName} wallet instantly.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6"
          >
            <Plus className="h-4 w-4" />
            List a home
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total listings" value={String(hostedListings.length)} />
          <StatCard label="Currently bookable" value={String(available.length)} />
          <StatCard label="Gross earnings" value={formatMoney(grossEarningsCents)} mono />
        </div>

        {isListingsLoading ? (
          <LoadingState />
        ) : hostedListings.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="space-y-10">
            {available.length > 0 && (
              <Section title="Live listings" desc="Visible in stays. Guests can reserve.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {available.map((l) => (
                    <HostListingCard
                      key={l.id}
                      listing={l}
                      onUnlist={() => handleUnlist(l)}
                    />
                  ))}
                </div>
              </Section>
            )}
            {booked.length > 0 && (
              <Section title="Booked" desc="Guest is checked in. Funds have settled.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {booked.map((l) => (
                    <HostListingCard key={l.id} listing={l} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </main>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              List a home
            </DialogTitle>
            <DialogDescription>
              Tell guests about your space, then pick the rental window and nightly price.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Listing title</Label>
              <Input
                id="title"
                placeholder="Sunny cottage minutes from downtown"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Asheville, NC"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="A peaceful retreat with a fireplace, hot tub, and walking trails out the back door."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="check-in">Check-in</Label>
                <Input
                  id="check-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  disabled={busy}
                  className="font-mono"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="check-out">Check-out</Label>
                <Input
                  id="check-out"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  disabled={busy}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ppn">Price per night (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  $
                </span>
                <Input
                  id="ppn"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="125.00"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  disabled={busy}
                  className="pl-7 font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={busy}
              className="rounded-full font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={busy}
              className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {busy ? 'Listing…' : 'Publish listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
    </section>
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
      <div
        className={`text-2xl font-extrabold tabular-nums ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

function HostListingCard({
  listing,
  onUnlist,
}: {
  listing: ListingRecord;
  onUnlist?: () => void;
}) {
  const isBooked = listing.status === 'booked';
  return (
    <div className="rounded-3xl border bg-card overflow-hidden hover:shadow-md transition-all">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.imageUrl || '/placeholder.svg'}
          alt={listing.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          {isBooked ? (
            <Badge variant="success" className="rounded-full font-bold">
              <CheckCircle2 className="h-3 w-3" />
              Booked by {listing.bookedByHandle ?? 'guest'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full font-bold bg-background/95 backdrop-blur border">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight leading-snug">{listing.title}</h3>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5 flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {formatDateShort(listing.checkIn)} – {formatDateShort(listing.checkOut)} ·{' '}
              {listing.nights} {listing.nights === 1 ? 'night' : 'nights'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-base font-extrabold font-mono tabular-nums">
              {formatMoney(listing.totalPriceCents)}
            </div>
            <div className="text-[10px] font-semibold text-muted-foreground">
              {formatMoney(listing.pricePerNightCents)} / night
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isBooked && onUnlist && (
            <Button
              onClick={onUnlist}
              variant="outline"
              className="rounded-full font-bold border h-9"
              size="sm"
            >
              <X className="h-3.5 w-3.5" />
              Remove listing
            </Button>
          )}
          {isBooked && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Funds settled to your wallet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-3xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Home className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Loading your listings…</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Home className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">You&apos;re not hosting yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          List your space to start earning. Once a guest books, funds land in your{' '}
          {branding.productName} wallet automatically.
        </p>
      </div>
      <Button
        onClick={onCreate}
        className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        List your first home
      </Button>
    </div>
  );
}

function formatDateShort(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
