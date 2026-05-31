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
import { TrendingUp, ArrowDownToLine, ArrowUpFromLine, Wallet, Activity, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  const payer = await getPayer(session.payerId);
  let walletLabel = 'Not Activated';
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
        <section className="rounded-3xl border border-border bg-card p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {branding.productName}
          </div>
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
              href="/dashboard/buy"
              title="Buy crypto"
              desc="Purchase BTC, ETH, SOL, or USDC from your balance."
              icon={<TrendingUp className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/sell"
              title="Sell crypto"
              desc="Convert your crypto holdings back to USD."
              icon={<ArrowUpFromLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payer"
              title={`Fund ${branding.walletName}`}
              desc={`Pull funds via ACH from your ${branding.funderShortLabel.toLowerCase()}.`}
              icon={<ArrowDownToLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payouts"
              title={branding.payoutVerb}
              desc={`Send your ${branding.walletName} to a linked bank or card.`}
              icon={<Wallet className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            At a glance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={branding.walletName} value={walletLabel} icon={<Wallet className="h-4 w-4" />} />
            <StatCard label="Portfolio value" value="$0.00" icon={<TrendingUp className="h-4 w-4" />} />
            <StatCard label={branding.payoutNounPlural} value="0" icon={<Activity className="h-4 w-4" />} />
            <StatCard label={branding.payeePlural} value="0" icon={<Users className="h-4 w-4" />} />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-xl font-extrabold tracking-tight">Your {branding.productName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to manage your crypto portfolio.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/buy"
              title="Buy crypto"
              desc="Trade USD for BTC, ETH, SOL, or USDC at live mocked rates."
            />
            <ModuleTile
              href="/dashboard/sell"
              title="Sell crypto"
              desc="Convert holdings back to USD at the same mocked rate."
            />
            <ModuleTile
              href="/dashboard/payouts"
              title={branding.payoutNounPlural}
              desc={`Move your ${branding.walletName} to a bank or debit card.`}
            />
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc={`Manage banks and debit cards you ${branding.payoutVerb.toLowerCase()} to.`}
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Activity"
              desc="Full audit of every wallet move and crypto trade."
            />
            <ModuleTile
              href="/dashboard/payer"
              title={branding.walletName}
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
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-extrabold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function ActionTile({
  href, title, desc, icon, primary,
}: {
  href: string; title: string; desc: string; icon: ReactNode; primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-2xl border p-5 transition-all ${
        primary
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          primary ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-base font-extrabold tracking-tight mb-0.5">{title}</div>
        <p className={`text-sm leading-snug ${
          primary ? 'text-primary-foreground/75' : 'text-muted-foreground'
        }`}>
          {desc}
        </p>
      </div>
    </Link>
  );
}

function ModuleTile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border p-5 transition-all bg-card hover:border-primary/50 hover:shadow-md"
    >
      <h3 className="font-extrabold tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
        Open →
      </div>
    </Link>
  );
}
