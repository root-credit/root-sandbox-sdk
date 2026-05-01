import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Home,
  Plane,
  Search,
  Wallet,
} from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardOverviewHero } from '@/components/DashboardOverviewHero';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-10">
        {/* Hero */}
        <section className="mb-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest mb-5">
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

        {/* Stat row — static placeholders per template contract */}
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            At a glance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Wallet balance" value="$0.00" icon={<Wallet className="h-4 w-4" />} />
            <StatCard label="Hosted listings" value="0" icon={<Home className="h-4 w-4" />} />
            <StatCard label="Trips booked" value="0" icon={<Plane className="h-4 w-4" />} />
            <StatCard
              label={branding.payoutNounPlural}
              value="$0.00"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionTile
              href="/dashboard/marketplace"
              title="Find a stay"
              desc="Browse homes guests are renting tonight."
              icon={<Search className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/domains"
              title="List your home"
              desc="Open your space to guests for a window."
              icon={<Home className="h-5 w-5" />}
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
              desc={`Move funds to a ${branding.payeeSingular.toLowerCase()}.`}
              icon={<ArrowUpFromLine className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-3xl border bg-card overflow-hidden">
          <div className="border-b px-7 py-6">
            <h2 className="text-xl font-extrabold tracking-tight">Everything in your console</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              The full set of tools to host, travel, and move money.
            </p>
          </div>
          <div className="p-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/marketplace"
              title="Stays"
              desc="Browse every home that other accounts are currently renting."
            />
            <ModuleTile
              href="/dashboard/domains"
              title="Hosting"
              desc="See homes you've listed. Update or remove a listing."
            />
            <ModuleTile
              href="/dashboard/trips"
              title="Trips"
              desc="Every stay you've booked, with check-in dates and receipts."
            />
            <ModuleTile
              href="/dashboard/payouts"
              title={branding.payoutNounPlural}
              desc={`Move wallet funds to a ${branding.payeeSingular.toLowerCase()}.`}
            />
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc={`Manage banks and debit cards you ${branding.payoutVerb.toLowerCase()} to.`}
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Activity"
              desc="Audit every wallet move with full receipts."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-2">
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
      className={`group flex flex-col gap-3 rounded-2xl border p-5 transition-all ${
        primary
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          : 'bg-card hover:border-foreground/30 hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          primary ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-primary/10 text-primary'
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
          primary ? 'text-primary-foreground/85' : 'text-foreground'
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
      className="group block rounded-2xl border p-5 transition-all bg-card hover:border-foreground/30 hover:shadow-md"
    >
      <h3 className="font-extrabold tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
        Open →
      </div>
    </Link>
  );
}
