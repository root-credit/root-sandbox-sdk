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
import { getMyOwnedDomains } from '@/lib/godaddy-actions';
import { TrendingUp, TrendingDown, Wallet, ArrowDownToLine, ArrowUpFromLine, Activity } from 'lucide-react';

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

  const ownedAssets = await getMyOwnedDomains();
  const holdingsCount = ownedAssets.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        {/* Hero */}
        <section className="rounded-2xl border border-border bg-card p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground mb-5">
            {branding.productName} console
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05] max-w-3xl text-foreground">
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
              title="Buy crypto"
              desc="Buy BTC, ETH, SOL, or USDC with your cash balance."
              icon={<TrendingUp className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/domains"
              title="Sell crypto"
              desc="Sell your holdings back to your cash balance."
              icon={<TrendingDown className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payer"
              title="Add funds"
              desc={`Pull funds via ACH from your ${branding.funderShortLabel.toLowerCase()}.`}
              icon={<ArrowDownToLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payouts"
              title={branding.payoutVerb}
              desc={`Move funds out to a ${branding.payeeSingular.toLowerCase()}.`}
              icon={<ArrowUpFromLine className="h-5 w-5" />}
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
            <StatCard label="Holdings" value={String(holdingsCount)} icon={<TrendingUp className="h-4 w-4" />} />
            <StatCard label="24h change" value="+$0.00" icon={<Activity className="h-4 w-4" />} />
            <StatCard
              label={branding.payoutNounPlural}
              value="$0.00"
              icon={<ArrowUpFromLine className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Live prices */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Live prices
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PriceCard symbol="BTC" name="Bitcoin" price="$67,234.50" change="+2.4%" positive />
            <PriceCard symbol="ETH" name="Ethereum" price="$3,456.78" change="+1.8%" positive />
            <PriceCard symbol="SOL" name="Solana" price="$142.56" change="-0.5%" />
            <PriceCard symbol="USDC" name="USD Coin" price="$1.00" change="0.0%" positive />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">Modules</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to manage your crypto portfolio.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/marketplace"
              title="Buy crypto"
              desc="Purchase BTC, ETH, SOL, or USDC with your cash balance."
            />
            <ModuleTile
              href="/dashboard/domains"
              title="Sell crypto"
              desc="Sell your holdings back into USD."
            />
            <ModuleTile
              href="/dashboard/payouts"
              title={branding.payoutNounPlural}
              desc={`Move ${branding.walletName} funds to a ${branding.payeeSingular.toLowerCase()}.`}
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
            <ModuleTile
              href="/dashboard/payer"
              title={branding.payerSingular}
              desc={`Profile, ${branding.funderShortLabel.toLowerCase()}, and ${branding.walletName} settings.`}
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
      <div className="text-3xl font-extrabold font-mono tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function PriceCard({
  symbol,
  name,
  price,
  change,
  positive,
}: {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 w-12">
          {symbol}
        </span>
        <span className={`text-xs font-bold ${positive ? 'text-accent' : 'text-destructive'}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{name}</p>
        <p className="text-xl font-extrabold font-mono tabular-nums text-foreground">{price}</p>
      </div>
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
          : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          primary ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className={`text-base font-extrabold tracking-tight mb-0.5 ${primary ? 'text-primary-foreground' : 'text-foreground'}`}>{title}</div>
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
          primary ? 'text-primary-foreground/70' : 'text-foreground'
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
      className="group block rounded-xl border border-border p-5 transition-all bg-card hover:border-primary/50 hover:shadow-md"
    >
      <h3 className="font-extrabold tracking-tight mb-1.5 text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
        Open →
      </div>
    </Link>
  );
}
