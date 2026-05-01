'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Briefcase, CalendarPlus, CheckCircle2, Clock, MapPin, Plus, X } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useServiceStore } from '@/components/ServiceStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { dollarsToCents, formatMoney } from '@/lib/types/payments';
import type { ServiceListingRecord } from '@/lib/staffing-actions';
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
import { cn } from '@/lib/utils';

const ROLE_OPTIONS = [
  'Dental Hygienist',
  'Dental Assistant',
  'Front Desk',
  'Office Manager',
  'Sterilization Tech',
  'Treatment Coordinator',
];

export default function MyShiftsPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { postedServices, isServicesLoading, postService, unlistService } = useServiceStore();
  const [postOpen, setPostOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({
    role: ROLE_OPTIONS[0],
    shiftDate: nextWeekdayIso(),
    hours: '8',
    hourlyRate: '45',
    location: '',
  });

  if (!session) return null;

  const live = postedServices.filter((s) => s.status === 'available');
  const booked = postedServices.filter((s) => s.status === 'booked');

  async function handlePost() {
    if (posting) return;
    const hours = Number(form.hours);
    const rate = Number(form.hourlyRate);
    if (!Number.isFinite(hours) || hours <= 0) {
      toast.error('Hours must be greater than zero.');
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error('Hourly rate must be greater than zero.');
      return;
    }
    setPosting(true);
    try {
      const result = await postService({
        role: form.role,
        shiftDate: form.shiftDate,
        hours,
        hourlyRateCents: dollarsToCents(rate),
        location: form.location,
      });
      if (result.ok) {
        toast.success(
          `Posted ${form.role} shift on ${form.shiftDate}. It's live in the marketplace.`,
        );
        setPostOpen(false);
        setForm((f) => ({ ...f, location: '' }));
      } else {
        toast.error(result.reason);
      }
    } finally {
      setPosting(false);
    }
  }

  async function handleUnlist(service: ServiceListingRecord) {
    if (!confirm(`Take down the ${service.role} shift on ${service.shiftDate}?`)) return;
    const result = await unlistService(service.id);
    if (result.ok) {
      toast.success('Shift removed from the marketplace.');
    } else {
      toast.error(result.reason);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="My shifts" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">My shifts</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Every shift you&apos;ve posted. Fill the days you can work, set your hourly rate,
              and other {branding.payerPlural.toLowerCase()} can hire you on the spot.
            </p>
          </div>
          <Button
            onClick={() => setPostOpen(true)}
            className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90 h-11 px-5"
          >
            <Plus className="h-4 w-4" />
            Post a shift
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Posted" value={String(postedServices.length)} />
          <StatCard label="Live now" value={String(live.length)} />
          <StatCard
            label="Earnings booked"
            value={formatMoney(booked.reduce((sum, s) => sum + s.totalCents, 0))}
          />
        </div>

        {isServicesLoading ? (
          <LoadingState />
        ) : postedServices.length === 0 ? (
          <EmptyState onPost={() => setPostOpen(true)} />
        ) : (
          <div className="space-y-8">
            {live.length > 0 && (
              <Section title="Live in marketplace" desc="Open for hire. Take down anytime.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {live.map((s) => (
                    <ShiftRow key={s.id} service={s} onUnlist={() => handleUnlist(s)} />
                  ))}
                </div>
              </Section>
            )}
            {booked.length > 0 && (
              <Section title="Booked shifts" desc="Hired by another member. Earnings settled to your wallet.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booked.map((s) => (
                    <ShiftRow key={s.id} service={s} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </main>

      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              Post a shift
            </DialogTitle>
            <DialogDescription>
              Fill in your role, the date, hours, and hourly rate. Other {branding.payerPlural.toLowerCase()} will see it instantly in the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="post-role">Role</Label>
              <select
                id="post-role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                )}
                disabled={posting}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="post-date">Shift date</Label>
                <Input
                  id="post-date"
                  type="date"
                  value={form.shiftDate}
                  onChange={(e) => setForm((f) => ({ ...f, shiftDate: e.target.value }))}
                  disabled={posting}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="post-hours">Hours</Label>
                <Input
                  id="post-hours"
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  value={form.hours}
                  onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                  disabled={posting}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="post-rate">Hourly rate (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                    $
                  </span>
                  <Input
                    id="post-rate"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.hourlyRate}
                    onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                    disabled={posting}
                    className="pl-7 font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="post-location">Location</Label>
                <Input
                  id="post-location"
                  type="text"
                  placeholder="Austin, TX"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  disabled={posting}
                />
              </div>
            </div>

            <div className="rounded-xl bg-secondary p-4 flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Estimated total
              </span>
              <span className="font-mono font-extrabold tabular-nums text-lg">
                {formatMoney(estimatedTotalCents(form))}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPostOpen(false)}
              className="rounded-full font-bold"
              disabled={posting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={posting}
              className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90"
            >
              {posting ? 'Posting…' : 'Post shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function estimatedTotalCents(form: { hours: string; hourlyRate: string }): number {
  const hours = Number(form.hours);
  const rate = Number(form.hourlyRate);
  if (!Number.isFinite(hours) || !Number.isFinite(rate) || hours <= 0 || rate <= 0) {
    return 0;
  }
  return Math.round(rate * 100 * hours);
}

function nextWeekdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
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

function ShiftRow({
  service,
  onUnlist,
}: {
  service: ServiceListingRecord;
  onUnlist?: () => void;
}) {
  const date = new Date(`${service.shiftDate}T00:00:00`);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isLive = service.status === 'available';
  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-3 hover:border-foreground transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4 text-muted-foreground flex-none" />
            <h3 className="text-lg font-extrabold tracking-tight">{service.role}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">{dateLabel}</p>
        </div>
        {isLive ? (
          <Badge variant="success" className="shrink-0 font-bold">
            <CalendarPlus className="h-3 w-3" />
            Live
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0 font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Booked
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Clock className="h-3.5 w-3.5" />
          {service.hours}h · {formatMoney(service.hourlyRateCents)}/hr
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <MapPin className="h-3.5 w-3.5" />
          {service.location}
        </span>
      </div>

      <div className="rounded-xl bg-primary/10 px-4 py-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {isLive ? 'Will earn' : 'Earned'}
        </div>
        <div className="text-2xl font-extrabold font-mono tabular-nums">
          {formatMoney(service.totalCents)}
        </div>
        {service.bookedByHandle && (
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Hired by {service.bookedByHandle}
          </p>
        )}
      </div>

      {isLive && onUnlist && (
        <div className="flex flex-wrap gap-2 mt-1">
          <Button
            onClick={onUnlist}
            variant="outline"
            className="rounded-full font-bold border-2 h-9"
            size="sm"
          >
            <X className="h-3.5 w-3.5" />
            Take down
          </Button>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Briefcase className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Loading your shifts…</p>
    </div>
  );
}

function EmptyState({ onPost }: { onPost: () => void }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <CalendarPlus className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">No posted shifts yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Post your first shift — pick a role, set your rate, and you&apos;re open for hire.
        </p>
      </div>
      <Button
        onClick={onPost}
        className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90"
      >
        <Plus className="h-4 w-4" />
        Post your first shift
      </Button>
    </div>
  );
}
