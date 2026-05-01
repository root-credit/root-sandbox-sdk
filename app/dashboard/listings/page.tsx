'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CalendarRange,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  MapPin,
  Plus,
} from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useRentalStore } from '@/components/RentalStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { formatMoney } from '@/lib/types/payments';
import type { RentalListing } from '@/lib/airbnb-actions';
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

const COVERS: { from: string; to: string; tone: string }[] = [
  { from: 'from-rose-200', to: 'to-orange-200', tone: 'text-rose-900' },
  { from: 'from-emerald-200', to: 'to-cyan-200', tone: 'text-emerald-900' },
  { from: 'from-amber-200', to: 'to-rose-200', tone: 'text-amber-900' },
  { from: 'from-sky-200', to: 'to-indigo-200', tone: 'text-sky-900' },
  { from: 'from-fuchsia-200', to: 'to-orange-200', tone: 'text-fuchsia-900' },
  { from: 'from-teal-200', to: 'to-lime-200', tone: 'text-teal-900' },
];

const todayIso = () => new Date().toISOString().slice(0, 10);
const plusDaysIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function MyListingsPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const {
    myListings,
    myBookings,
    isListingsLoading,
    createListing,
    unlist,
    relist,
  } = useRentalStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '',
    startDate: plusDaysIso(7),
    endDate: plusDaysIso(10),
    totalPriceDollars: '350.00',
  });

  if (!session) return null;

  const live = myListings.filter((d) => d.status === 'available');
  const off = myListings.filter((d) => d.status === 'unlisted');
  const booked = myListings.filter((d) => d.status === 'booked');

  function resetForm() {
    setForm({
      title: '',
      location: '',
      startDate: plusDaysIso(7),
      endDate: plusDaysIso(10),
      totalPriceDollars: '350.00',
    });
  }

  async function handleCreate() {
    if (busy) return;
    const dollars = Number(form.totalPriceDollars);
    setBusy(true);
    try {
      const result = await createListing({
        title: form.title,
        location: form.location,
        startDate: form.startDate,
        endDate: form.endDate,
        totalPriceDollars: dollars,
      });
      if (result.ok) {
        toast.success(`${result.listing?.title ?? 'Listing'} is now live.`);
        setCreateOpen(false);
        resetForm();
      } else {
        toast.error(result.reason);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlist(d: RentalListing) {
    const r = await unlist(d.id);
    if (r.ok) toast.success(`${d.title} hidden from the marketplace.`);
    else toast.error(r.reason);
  }

  async function handleRelist(d: RentalListing) {
    const r = await relist(d.id);
    if (r.ok) toast.success(`${d.title} is live again.`);
    else toast.error(r.reason);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-10">
        <Breadcrumb here="My listings" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Hosting on {branding.productName}
            </h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              List your place for a window of dates. Other {branding.payerPlural.toLowerCase()}{' '}
              can book it instantly with their wallet — funds settle into yours the moment they do.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 text-base shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add a listing
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total listings" value={String(myListings.length)} />
          <StatCard label="Live" value={String(live.length)} />
          <StatCard label="Booked" value={String(booked.length)} />
          <StatCard
            label="Earned (gross)"
            value={formatMoney(
              booked.reduce((sum, d) => sum + (d.totalPriceCents ?? 0), 0),
            )}
          />
        </div>

        {isListingsLoading ? (
          <LoadingState />
        ) : myListings.length === 0 ? (
          <EmptyState onAdd={() => setCreateOpen(true)} />
        ) : (
          <div className="space-y-10">
            {live.length > 0 && (
              <Section title="Live" desc="Visible in Explore. Unlist any time.">
                <Grid items={live} onUnlist={handleUnlist} onRelist={handleRelist} />
              </Section>
            )}
            {booked.length > 0 && (
              <Section title="Booked" desc="Already settled to your wallet.">
                <Grid items={booked} onUnlist={handleUnlist} onRelist={handleRelist} />
              </Section>
            )}
            {off.length > 0 && (
              <Section title="Off the marketplace" desc="Re-publish whenever you're ready.">
                <Grid items={off} onUnlist={handleUnlist} onRelist={handleRelist} />
              </Section>
            )}
          </div>
        )}

        {myBookings.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
              Your trips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b) => (
                <TripCard key={b.id} listing={b} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Create dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              List a new place
            </DialogTitle>
            <DialogDescription>
              Mocked — no real property is registered. Other members will be able to book this
              stay instantly using their {branding.productName} wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="listing-title">Title</Label>
              <Input
                id="listing-title"
                placeholder="Cozy mountain cabin with a view"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="listing-location">Location</Label>
              <Input
                id="listing-location"
                placeholder="Big Bear, California"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                disabled={busy}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="listing-start">Check-in</Label>
                <Input
                  id="listing-start"
                  type="date"
                  min={todayIso()}
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  disabled={busy}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="listing-end">Check-out</Label>
                <Input
                  id="listing-end"
                  type="date"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  disabled={busy}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="listing-price">Total price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  $
                </span>
                <Input
                  id="listing-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="350.00"
                  value={form.totalPriceDollars}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, totalPriceDollars: e.target.value }))
                  }
                  className="pl-7 font-mono"
                  disabled={busy}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="rounded-full font-bold"
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={busy}
              className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {busy ? 'Publishing…' : 'Publish listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function Grid({
  items,
  onUnlist,
  onRelist,
}: {
  items: RentalListing[];
  onUnlist: (d: RentalListing) => void;
  onRelist: (d: RentalListing) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((d) => (
        <ListingRow key={d.id} listing={d} onUnlist={onUnlist} onRelist={onRelist} />
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-extrabold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function ListingRow({
  listing,
  onUnlist,
  onRelist,
}: {
  listing: RentalListing;
  onUnlist: (d: RentalListing) => void;
  onRelist: (d: RentalListing) => void;
}) {
  const cover = COVERS[(listing.coverSeed - 1) % COVERS.length];
  const initials = listing.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  const StatusBadge = () => {
    if (listing.status === 'available') {
      return (
        <Badge variant="success" className="font-bold">
          <CheckCircle2 className="h-3 w-3" />
          Live
        </Badge>
      );
    }
    if (listing.status === 'booked') {
      return (
        <Badge variant="default" className="font-bold">
          Booked
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-bold">
        Off
      </Badge>
    );
  };

  return (
    <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all flex flex-col">
      <div
        className={`relative h-32 bg-gradient-to-br ${cover.from} ${cover.to} flex items-center justify-center`}
      >
        <span className={`text-4xl font-extrabold ${cover.tone} opacity-80`}>{initials}</span>
        <span className="absolute top-3 right-3">
          <StatusBadge />
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-base font-extrabold tracking-tight leading-tight">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </p>
        </div>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarRange className="h-3 w-3" />
          {fmtRange(listing.startDate, listing.endDate)} · {listing.nights}{' '}
          {listing.nights === 1 ? 'night' : 'nights'}
        </p>
        <div className="rounded-xl bg-secondary px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </div>
          <div className="text-lg font-extrabold font-mono tabular-nums">
            {formatMoney(listing.totalPriceCents)}
          </div>
        </div>
        {listing.status === 'booked' && listing.bookedByHandle && (
          <p className="text-xs text-muted-foreground font-semibold">
            Booked by {listing.bookedByHandle}
          </p>
        )}
        {listing.status === 'available' && (
          <Button
            onClick={() => onUnlist(listing)}
            variant="outline"
            size="sm"
            className="rounded-full font-bold mt-auto"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Take down
          </Button>
        )}
        {listing.status === 'unlisted' && (
          <Button
            onClick={() => onRelist(listing)}
            size="sm"
            className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-auto"
          >
            <Eye className="h-3.5 w-3.5" />
            Republish
          </Button>
        )}
      </div>
    </div>
  );
}

function TripCard({ listing }: { listing: RentalListing }) {
  const cover = COVERS[(listing.coverSeed - 1) % COVERS.length];
  return (
    <div
      className={`rounded-2xl border overflow-hidden bg-gradient-to-br ${cover.from} ${cover.to} relative`}
    >
      <div className="bg-card/95 backdrop-blur-sm m-1 rounded-2xl p-5 flex flex-col gap-2">
        <Badge variant="default" className="font-bold w-fit">
          Trip booked
        </Badge>
        <h3 className="text-lg font-extrabold tracking-tight">{listing.title}</h3>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          {listing.location} · Hosted by {listing.hostHandle}
        </p>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarRange className="h-3 w-3" />
          {fmtRange(listing.startDate, listing.endDate)}
        </p>
        <div className="text-base font-extrabold font-mono tabular-nums mt-1">
          {formatMoney(listing.totalPriceCents)}
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Home className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">No listings yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Add your first place — set the dates and the total price, and other members can book
          it instantly.
        </p>
      </div>
      <Button
        onClick={onAdd}
        className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        List your first place
      </Button>
    </div>
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
