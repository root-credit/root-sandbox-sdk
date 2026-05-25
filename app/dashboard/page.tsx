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
import { ArrowRight, Send, Users, Wallet, Activity, Plus, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CURRENCY_PAIRS = [
  { from: 'USD', to: 'EUR', rate: '0.92', flag: '🇪🇺' },
  { from: 'USD', to: 'INR', rate: '83.42', flag: '🇮🇳' },
  { from: 'USD', to: 'MXN', rate: '17.24', flag: '🇲🇽' },
  { from: 'USD', to: 'GBP', rate: '0.79', flag: '🇬🇧' },
];

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
        {/* Hero section */}
        <section className="rounded-lg border border-border bg-background p-6 md:p-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
            {branding.consoleHeading}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {branding.consoleSubheading}
          </p>

          <DashboardOverviewHero />
        </section>

        {/* Quick actions */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionTile
              href="/dashboard/marketplace"
              title={`${branding.payoutVerb} money`}
              desc="Start a new international transfer"
              icon={<Send className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/payees"
              title={`Add ${branding.payeeSingular.toLowerCase()}`}
              desc="Save a new recipient for transfers"
              icon={<Plus className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payer"
              title="Add money"
              desc={`Fund your ${branding.walletName}`}
              icon={<Wallet className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/transactions"
              title="View activity"
              desc="Track all your transfers"
              icon={<Activity className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Exchange rates */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Today&apos;s exchange rates
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CURRENCY_PAIRS.map((pair) => (
              <div 
                key={pair.to} 
                className="rounded-lg border border-border bg-background p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{pair.flag}</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {pair.from} to {pair.to}
                  </span>
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-foreground">
                  {pair.rate}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mid-market rate
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Your account
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label={branding.walletName} 
              value={walletLabel} 
              icon={<Wallet className="h-4 w-4" />} 
            />
            <StatCard 
              label={branding.payeePlural} 
              value="0" 
              icon={<Users className="h-4 w-4" />} 
            />
            <StatCard 
              label={`Total ${branding.payoutNounPlural.toLowerCase()}`} 
              value="$0.00" 
              icon={<Send className="h-4 w-4" />} 
            />
            <StatCard
              label="Countries"
              value="80+"
              icon={<Globe className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-lg border border-border bg-background overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Features</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to send money abroad.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/marketplace"
              title={branding.payoutNounPlural}
              desc="Send money to your recipients in 80+ countries."
            />
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc={`Manage the people you ${branding.payoutVerb.toLowerCase()} money to.`}
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Activity"
              desc="Track every transfer with full details."
            />
            <ModuleTile
              href="/dashboard/payer"
              title={branding.payerSingular}
              desc={`Your profile, bank account, and ${branding.walletName}.`}
            />
            <ModuleTile
              href="/dashboard/payouts"
              title="Cash out"
              desc="Withdraw balance to your linked bank account."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold font-mono tabular-nums text-foreground">{value}</div>
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
      className={`group flex flex-col gap-3 rounded-lg border p-5 transition-all ${
        primary
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          : 'bg-background border-border hover:border-primary'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          primary ? 'bg-background/20 text-primary-foreground' : 'bg-card text-foreground'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className={`text-base font-semibold tracking-tight mb-0.5 ${
          primary ? 'text-primary-foreground' : 'text-foreground'
        }`}>
          {title}
        </div>
        <p
          className={`text-sm leading-snug ${
            primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {desc}
        </p>
      </div>
      <div
        className={`mt-auto flex items-center gap-1 text-xs font-medium ${
          primary ? 'text-primary-foreground/80' : 'text-muted-foreground group-hover:text-foreground'
        }`}
      >
        <span>Open</span>
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function ModuleTile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-border p-5 transition-all bg-background hover:border-primary"
    >
      <h3 className="font-semibold tracking-tight mb-1.5 text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        <span>Open</span>
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
