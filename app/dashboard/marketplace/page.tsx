'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarCheck, HardHat, Search, Wallet } from 'lucide-react';
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
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return marketplaceDomains;
    return marketplaceDomains.filter(
      (d) => d.name.toLowerCase().includes(q) || d.sellerHandle.toLowerCase().includes(q),
    );
  }, [marketplaceDomains, query]);

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;

  async function handleBook(worker: MarketplaceDomainRecord) {
    if (!walletEnabled) {
      toast.error(`Activate your ${branding.productName} wallet before booking.`);
      return;
    }
    if (balance < worker.priceCents) {
      toast.error(
        `Insufficient wallet balance. Booking ${formatWorkerName(worker.name)} costs ${formatMoney(worker.priceCents)}.`,
      );
      return;
    }
    if (
      !confirm(
        `Book ${formatWorkerName(worker.name)} for ${formatMoney(worker.priceCents)} from your ${branding.productName} wallet?`,
      )
    ) {
      return;
    }
    setBusyId(worker.id);
    try {
      const result = await buy(worker.id);
      if (result.ok) {
        toast.success(`Booked ${formatWorkerName(worker.name)}. They're now on your crew.`);
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
        <Breadcrumb here="Marketplace" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Talent marketplace</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Browse {branding.payeePlural.toLowerCase()} posted by other{' '}
              {branding.payerPlural.toLowerCase()}. Book a shift with your{' '}
              {branding.productName} wallet — funds settle instantly worker-to-worker.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${branding.payeePlural.toLowerCase()} or workplaces…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 rounded-full bg-card font-medium"
            />
          </div>
        </div>

        {isDomainsLoading ? (
          <ListingShell title="Loading marketplace…" body="Fetching active shift postings." />
        ) : filtered.length === 0 ? (
          <ListingShell
            title={
              marketplaceDomains.length === 0
                ? 'No open shifts right now'
                : 'No matches'
            }
            body={
              marketplaceDomains.length === 0
                ? `As ${branding.payerPlural.toLowerCase()} post ${branding.payeePlural.toLowerCase()} for shifts, they'll appear here in real time.`
                : 'Try a different search term.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <WorkerCard
                key={d.id}
                worker={d}
                affordable={walletEnabled && balance >= d.priceCents}
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
    <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <HardHat className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      </div>
    </div>
  );
}

function WorkerCard({
  worker,
  affordable,
  busy,
  onBook,
}: {
  worker: MarketplaceDomainRecord;
  affordable: boolean;
  busy: boolean;
  onBook: () => void;
}) {
  const display = formatWorkerName(worker.name);
  const initials = display
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="group flex flex-col rounded-2xl border-2 bg-card overflow-hidden hover:border-foreground hover:shadow-lg transition-all">
      <div className="px-5 py-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-foreground text-background text-sm font-extrabold">
            {initials || '??'}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-extrabold tracking-tight truncate">{display}</h3>
            <p className="text-xs font-mono font-semibold text-muted-foreground mt-0.5 truncate">
              {worker.name}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1.5">
              Posted by {worker.sellerHandle}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
            <CalendarCheck className="h-3 w-3" />
            Available now
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Vetted
          </span>
        </div>
      </div>
      <div className="border-t-2 px-5 py-4 flex items-center justify-between gap-3 bg-secondary">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Day rate
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums">
            {formatMoney(worker.priceCents)}
          </div>
        </div>
        <Button
          onClick={onBook}
          disabled={!affordable || busy}
          className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          <CalendarCheck className="h-4 w-4" />
          {busy ? 'Booking…' : affordable ? 'Book shift' : 'Top up wallet'}
        </Button>
      </div>
    </article>
  );
}

/**
 * Worker handles in Redis follow the legacy domain-style format (e.g. `alex-rivera.shift`).
 * For display, drop everything after the last dot and turn dashes into spaces.
 */
function formatWorkerName(handle: string): string {
  const base = handle.split('.')[0] ?? handle;
  return base
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
