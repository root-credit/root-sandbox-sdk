import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardOverviewHero } from '@/components/DashboardOverviewHero';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';
import { getPayer } from '@/lib/redis';
import { getSubaccountLedgerSnapshot } from '@/lib/root-api';
import { formatMoney } from '@/lib/types/payments';
import { Wallet, Send, ArrowDownToLine, Activity, Users } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        {/* Hero */}
        <section className="rounded-3xl border bg-card p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground mb-5">
            {branding.productName}
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
              href="/dashboard/payouts"
              title="Send money"
              desc="Pay a friend or split a bill instantly."
              icon={<Send className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/payer"
              title="Add money"
              desc={`Transfer from your ${branding.funderShortLabel.toLowerCase()}.`}
              icon={<ArrowDownToLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payees"
              title={branding.payoutVerb}
              desc="Move your balance to your bank or card."
              icon={<Wallet className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/transactions"
              title="Activity"
              desc="See all your recent transactions."
              icon={<Activity className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            At a glance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Wallet balance" value={walletLabel} icon={<Wallet className="h-4 w-4" />} />
            <StatCard label="Total sent" value="$0.00" icon={<Send className="h-4 w-4" />} />
            <StatCard label="Total received" value="$0.00" icon={<ArrowDownToLine className="h-4 w-4" />} />
            <StatCard
              label={branding.payoutNounPlural}
              value="$0.00"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-extrabold tracking-tight">Manage your money</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to send, receive, and manage payments.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/payouts"
              title="Send & Request"
              desc="Send money to friends or request payments."
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Activity"
              desc="View your complete transaction history."
            />
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc={`Manage your ${branding.payoutVerb.toLowerCase()} destinations.`}
            />
            <ModuleTile
              href="/dashboard/payer"
              title="Wallet settings"
              desc={`Your profile, ${branding.funderShortLabel.toLowerCase()}, and wallet.`}
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
          : 'bg-card hover:border-primary hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          primary ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-base font-extrabold tracking-tight mb-0.5">{title}</div>
        <p
          className={`text-sm leading-snug ${
            primary ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {desc}
        </p>
      </div>
      <div
        className={`mt-auto text-xs font-bold uppercase tracking-widest ${
          primary ? 'text-primary-foreground/70' : 'text-muted-foreground group-hover:text-primary'
        }`}
      >
        Open
      </div>
    </Link>
  );
}

function ModuleTile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border p-5 transition-all bg-card hover:border-primary hover:shadow-md"
    >
      <h3 className="font-extrabold tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
        Open
      </div>
    </Link>
  );
}
