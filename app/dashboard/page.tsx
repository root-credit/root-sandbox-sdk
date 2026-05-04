import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  HardHat,
  Users,
  Wallet,
} from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardOverviewHero } from '@/components/DashboardOverviewHero';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';
import { getPayer } from '@/lib/redis';
import { getSubaccountLedgerSnapshot } from '@/lib/root-api';
import { formatMoney } from '@/lib/types/payments';
import { getMyOwnedDomains } from '@/lib/godaddy-actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  const payer = await getPayer(session.payerId);
  let walletLabel = 'Not activated';
  if (payer?.subaccountId) {
    try {
      const snap = await getSubaccountLedgerSnapshot(payer.subaccountId);
      walletLabel = formatMoney(snap.balanceCents);
    } catch {
      walletLabel = '—';
    }
  }

  const roster = await getMyOwnedDomains();
  const rosterCount = roster.length;
  const availableCount = roster.filter((d) => d.listingPriceCents !== undefined).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        {/* Hero */}
        <section className="rounded-3xl border-2 bg-card p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground mb-5">
            {branding.productName} console
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05] max-w-3xl">
            {branding.consoleHeading}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            {branding.consoleSubheading}
          </p>

          <DashboardOverviewHero />
        </section>

        {/* Quick actions */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionTile
              href="/dashboard/marketplace"
              title="Browse talent"
              desc={`Find a ${branding.payeeSingular.toLowerCase()} and book with your wallet.`}
              icon={<HardHat className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/domains"
              title="Post a shift"
              desc="Mark a worker available to other workplaces."
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payer"
              title="Top up wallet"
              desc={`Pull funds via ACH from your ${branding.funderShortLabel.toLowerCase()}.`}
              icon={<ArrowDownToLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payouts"
              title={branding.payoutVerb}
              desc={`Move wages out to a ${branding.payeeSingular.toLowerCase()}.`}
              icon={<ArrowUpFromLine className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Stats — wallet from Root; roster counts match /dashboard/domains (Redis via getMyOwnedDomains) */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            At a glance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={`${branding.productName} wallet`}
              value={walletLabel}
              icon={<Wallet className="h-4 w-4" />}
            />
            <StatCard
              label="Crew roster"
              value={String(rosterCount)}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Posted to marketplace"
              value={String(availableCount)}
              icon={<ClipboardList className="h-4 w-4" />}
            />
            <StatCard
              label={branding.payoutNounPlural}
              value="$0.00"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-2xl border-2 bg-card overflow-hidden">
          <div className="border-b-2 px-6 py-5">
            <h2 className="text-xl font-extrabold tracking-tight">Modules</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to run the staffing side of your business.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/marketplace"
              title="Talent marketplace"
              desc={`Browse every ${branding.payeeSingular.toLowerCase()} available right now.`}
            />
            <ModuleTile
              href="/dashboard/domains"
              title="My crew"
              desc="See your roster. Post or unlist any shift."
            />
            <ModuleTile
              href="/dashboard/payouts"
              title={branding.payoutNounPlural}
              desc={`Pay wages from your wallet to a ${branding.payeeSingular.toLowerCase()}.`}
            />
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc={`Banks and debit cards you ${branding.payoutVerb.toLowerCase()} to.`}
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Activity"
              desc="Audit every wallet move with full receipts."
            />
            <ModuleTile
              href="/dashboard/payer"
              title={branding.payerSingular}
              desc={`Profile, ${branding.funderShortLabel.toLowerCase()}, and wallet settings.`}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-extrabold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function ActionTile({
  href,
  title,
  desc,
  icon,
  primary,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-2xl border-2 p-5 transition-all ${
        primary
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          : 'bg-card hover:border-foreground hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          primary ? 'bg-primary-foreground text-primary' : 'bg-primary/15 text-primary'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-base font-extrabold tracking-tight mb-0.5">{title}</div>
        <p
          className={`text-sm leading-snug ${
            primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {desc}
        </p>
      </div>
      <div
        className={`mt-auto text-xs font-bold uppercase tracking-widest ${
          primary ? 'text-primary-foreground/80' : 'text-foreground'
        }`}
      >
        Open →
      </div>
    </Link>
  );
}

function ModuleTile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border-2 p-5 transition-all bg-card hover:border-foreground hover:shadow-md"
    >
      <h3 className="font-extrabold tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
        Open →
      </div>
    </Link>
  );
}
