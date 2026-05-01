'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Briefcase, Clock, MapPin, Search, Wallet } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useServiceStore } from '@/components/ServiceStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import type { ServiceListingRecord } from '@/lib/staffing-actions';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function FindStaffPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const {
    walletBalanceCents,
    walletEnabled,
    availableServices,
    isServicesLoading,
    hireService,
  } = useServiceStore();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const roles = useMemo(() => {
    const s = new Set(availableServices.map((d) => d.role));
    return ['all', ...Array.from(s).sort()];
  }, [availableServices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableServices.filter((d) => {
      if (roleFilter !== 'all' && d.role !== roleFilter) return false;
      if (!q) return true;
      return (
        d.role.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.ownerHandle.toLowerCase().includes(q)
      );
    });
  }, [availableServices, query, roleFilter]);

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;

  async function handleHire(service: ServiceListingRecord) {
    if (!walletEnabled) {
      toast.error(`Set up your ${branding.productName} wallet before hiring.`);
      return;
    }
    if (balance < service.totalCents) {
      toast.error(
        `Insufficient wallet balance. Hiring this shift costs ${formatMoney(service.totalCents)}.`,
      );
      return;
    }
    if (
      !confirm(
        `Hire ${service.ownerHandle} for the ${service.role} shift on ${service.shiftDate} (${service.hours}h) for ${formatMoney(service.totalCents)}?`,
      )
    ) {
      return;
    }
    setBusyId(service.id);
    try {
      const result = await hireService(service.id);
      if (result.ok) {
        toast.success(
          `Hired ${service.ownerHandle} for ${service.role} on ${service.shiftDate}.`,
        );
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
        <Breadcrumb here="Find staff" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Find temp staff</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Browse open shifts posted by other {branding.payerPlural.toLowerCase()}. Hire from
              your wallet — funds settle to the poster instantly.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search role, city, or @handle…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 rounded-full bg-card font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full whitespace-nowrap border-2 transition-colors ${
                  roleFilter === r
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground'
                }`}
              >
                {r === 'all' ? 'All roles' : r}
              </button>
            ))}
          </div>
        </div>

        {isServicesLoading ? (
          <ListingShell title="Loading marketplace…" body="Fetching open shifts." />
        ) : filtered.length === 0 ? (
          <ListingShell
            title={
              availableServices.length === 0
                ? 'No open shifts yet'
                : 'No matches'
            }
            body={
              availableServices.length === 0
                ? `As ${branding.payerPlural.toLowerCase()} post their availability, shifts will show up here.`
                : 'Try a different search or role filter.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <ShiftCard
                key={d.id}
                service={d}
                affordable={walletEnabled && balance >= d.totalCents}
                busy={busyId === d.id}
                onHire={() => handleHire(d)}
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
        <Briefcase className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      </div>
    </div>
  );
}

function ShiftCard({
  service,
  affordable,
  busy,
  onHire,
}: {
  service: ServiceListingRecord;
  affordable: boolean;
  busy: boolean;
  onHire: () => void;
}) {
  const date = new Date(`${service.shiftDate}T00:00:00`);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return (
    <article className="group flex flex-col rounded-2xl border-2 bg-card overflow-hidden hover:border-foreground hover:shadow-lg transition-all">
      <div className="px-5 py-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary" className="font-bold">
            {service.role}
          </Badge>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {dateLabel}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight">
            {formatMoney(service.hourlyRateCents)}
            <span className="text-sm text-muted-foreground font-bold ml-1">/hr</span>
          </h3>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Posted by {service.ownerHandle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Clock className="h-3.5 w-3.5" />
            {service.hours}h shift
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <MapPin className="h-3.5 w-3.5" />
            {service.location}
          </span>
        </div>
      </div>
      <div className="border-t-2 px-5 py-4 flex items-center justify-between gap-3 bg-secondary">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total to hire
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums">
            {formatMoney(service.totalCents)}
          </div>
        </div>
        <Button
          onClick={onHire}
          disabled={!affordable || busy}
          className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          <Briefcase className="h-4 w-4" />
          {busy ? 'Hiring…' : affordable ? 'Hire' : 'Top up wallet'}
        </Button>
      </div>
    </article>
  );
}
