'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarCheck, ClipboardList, HardHat, Plus, X } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { dollarsToCents, formatMoney } from '@/lib/types/payments';
import type { OwnedDomainRecord } from '@/lib/godaddy-actions';
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

const HANDLE_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

/**
 * Convert a free-form display name like "Alex Rivera" into the storage handle
 * format expected by the action layer (e.g. `alex-rivera.shift`).
 */
function toWorkerHandle(displayName: string): string {
  const slug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) return '';
  return `${slug}.shift`;
}

/**
 * Inverse of toWorkerHandle for rendering.
 */
function formatWorkerName(handle: string): string {
  const base = handle.split('.')[0] ?? handle;
  return base
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function MyCrewPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { ownedDomains, isDomainsLoading, transferIn, listForSale, unlist } = useDomainStore();
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardName, setOnboardName] = useState('');
  const [onboardBusy, setOnboardBusy] = useState(false);

  const [postingWorker, setPostingWorker] = useState<OwnedDomainRecord | null>(null);
  const [postingRate, setPostingRate] = useState('');
  const [postingBusy, setPostingBusy] = useState(false);

  if (!session) return null;

  const posted = ownedDomains.filter((d) => d.listingPriceCents !== undefined);
  const idle = ownedDomains.filter((d) => d.listingPriceCents === undefined);

  async function handleOnboard() {
    if (onboardBusy) return;
    const handle = HANDLE_REGEX.test(onboardName.trim().toLowerCase())
      ? onboardName.trim().toLowerCase()
      : toWorkerHandle(onboardName);

    if (!handle) {
      toast.error('Enter a worker name to onboard.');
      return;
    }

    setOnboardBusy(true);
    try {
      const result = await transferIn(handle);
      if (result.ok) {
        toast.success(
          `Added ${formatWorkerName(result.domain?.name ?? handle)} to your crew.`,
        );
        setOnboardOpen(false);
        setOnboardName('');
      } else {
        toast.error(result.reason);
      }
    } finally {
      setOnboardBusy(false);
    }
  }

  function openPosting(worker: OwnedDomainRecord) {
    setPostingWorker(worker);
    setPostingRate(
      worker.listingPriceCents !== undefined
        ? (worker.listingPriceCents / 100).toFixed(2)
        : '',
    );
  }

  async function handleConfirmPosting() {
    if (!postingWorker || postingBusy) return;
    const dollars = parseFloat(postingRate);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error('Enter a valid day rate.');
      return;
    }
    const cents = dollarsToCents(dollars);
    setPostingBusy(true);
    try {
      const result = await listForSale(postingWorker.name, cents);
      if (result.ok) {
        toast.success(
          `${formatWorkerName(postingWorker.name)} posted at ${formatMoney(cents)} / day.`,
        );
        setPostingWorker(null);
        setPostingRate('');
      } else {
        toast.error(result.reason);
      }
    } finally {
      setPostingBusy(false);
    }
  }

  async function handleUnpost(worker: OwnedDomainRecord) {
    const result = await unlist(worker.name);
    if (result.ok) {
      toast.success(`${formatWorkerName(worker.name)} removed from the marketplace.`);
    } else {
      toast.error(result.reason);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="My crew" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">My crew</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Every {branding.payeeSingular.toLowerCase()} on your roster. Post one to the
              marketplace at a day rate to make them available to other{' '}
              {branding.payerPlural.toLowerCase()}.
            </p>
          </div>
          <Button
            onClick={() => setOnboardOpen(true)}
            className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5"
          >
            <Plus className="h-4 w-4" />
            Onboard a {branding.payeeSingular.toLowerCase()}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="On roster" value={String(ownedDomains.length)} />
          <StatCard label="Posted" value={String(posted.length)} />
          <StatCard
            label="Total ask"
            value={formatMoney(posted.reduce((sum, d) => sum + (d.listingPriceCents ?? 0), 0))}
          />
        </div>

        {isDomainsLoading ? (
          <LoadingState />
        ) : ownedDomains.length === 0 ? (
          <EmptyState onOnboard={() => setOnboardOpen(true)} />
        ) : (
          <div className="space-y-8">
            {posted.length > 0 && (
              <Section
                title="Posted to marketplace"
                desc="Visible to every workplace right now. Unpost any time."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posted.map((d) => (
                    <WorkerRow
                      key={d.id}
                      worker={d}
                      onPost={() => openPosting(d)}
                      onUnpost={() => handleUnpost(d)}
                    />
                  ))}
                </div>
              </Section>
            )}
            {idle.length > 0 && (
              <Section title="On roster" desc="Set a day rate to post a worker for shifts.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {idle.map((d) => (
                    <WorkerRow
                      key={d.id}
                      worker={d}
                      onPost={() => openPosting(d)}
                      onUnpost={() => handleUnpost(d)}
                    />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </main>

      <Dialog open={onboardOpen} onOpenChange={setOnboardOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              Onboard a {branding.payeeSingular.toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              Add a {branding.payeeSingular.toLowerCase()} to your crew roster. You can post them to
              the marketplace and pay them out from your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="onboard-name">Worker name</Label>
            <Input
              id="onboard-name"
              placeholder="Alex Rivera"
              value={onboardName}
              onChange={(e) => setOnboardName(e.target.value)}
              disabled={onboardBusy}
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll generate a handle automatically.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOnboardOpen(false)}
              className="rounded-full font-bold"
              disabled={onboardBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOnboard}
              disabled={onboardBusy}
              className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {onboardBusy ? 'Onboarding…' : 'Add to crew'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={postingWorker !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPostingWorker(null);
            setPostingRate('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              {postingWorker?.listingPriceCents !== undefined ? 'Update day rate' : 'Post to marketplace'}
            </DialogTitle>
            <DialogDescription>
              <span className="font-bold text-foreground">
                {postingWorker ? formatWorkerName(postingWorker.name) : ''}
              </span>{' '}
              will be visible to every {branding.payerSingular.toLowerCase()} in the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="posting-rate">Day rate (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                $
              </span>
              <Input
                id="posting-rate"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="180.00"
                value={postingRate}
                onChange={(e) => setPostingRate(e.target.value)}
                className="pl-7 font-mono"
                disabled={postingBusy}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPostingWorker(null)}
              className="rounded-full font-bold"
              disabled={postingBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPosting}
              disabled={postingBusy}
              className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {postingBusy
                ? 'Saving…'
                : postingWorker?.listingPriceCents !== undefined
                  ? 'Update rate'
                  : 'Post worker'}
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-extrabold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function WorkerRow({
  worker,
  onPost,
  onUnpost,
}: {
  worker: OwnedDomainRecord;
  onPost: () => void;
  onUnpost: () => void;
}) {
  const display = formatWorkerName(worker.name);
  const initials = display
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const isPosted = worker.listingPriceCents !== undefined;

  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-3 hover:border-foreground transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-foreground text-background text-sm font-extrabold">
            {initials || '??'}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold tracking-tight truncate">{display}</h3>
            <p className="text-xs font-mono font-semibold text-muted-foreground truncate">
              {worker.name}
            </p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              Onboarded{' '}
              {new Date(worker.registeredAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        {isPosted ? (
          <Badge variant="success" className="shrink-0 font-bold">
            <CalendarCheck className="h-3 w-3" />
            Posted
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0 font-bold">
            On roster
          </Badge>
        )}
      </div>
      {isPosted && (
        <div className="rounded-xl bg-primary/10 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Day rate
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums">
            {formatMoney(worker.listingPriceCents ?? 0)}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-1">
        <Button
          onClick={onPost}
          className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-9"
          size="sm"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          {isPosted ? 'Update rate' : 'Post for a shift'}
        </Button>
        {isPosted && (
          <Button
            onClick={onUnpost}
            variant="outline"
            className="rounded-full font-bold border-2 h-9"
            size="sm"
          >
            <X className="h-3.5 w-3.5" />
            Unpost
          </Button>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <HardHat className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Loading your crew…</p>
    </div>
  );
}

function EmptyState({ onOnboard }: { onOnboard: () => void }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <HardHat className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">No crew yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Onboard your first {branding.payeeSingular.toLowerCase()} to start posting shifts.
        </p>
      </div>
      <Button
        onClick={onOnboard}
        className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Onboard your first {branding.payeeSingular.toLowerCase()}
      </Button>
    </div>
  );
}
