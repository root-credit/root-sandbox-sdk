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
import { 
  Wallet, 
  PiggyBank, 
  ArrowRightLeft, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Activity,
  Settings,
  TrendingUp
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  const payer = await getPayer(session.payerId);
  let spendingBalance = 'Not Activated';
  if (payer?.subaccountId) {
    try {
      const snap = await getSubaccountLedgerSnapshot(payer.subaccountId);
      spendingBalance = formatMoney(snap.balanceCents);
    } catch {
      spendingBalance = '—';
    }
  }

  // Mocked savings balance and APY
  const savingsBalance = '$5,200.00';
  const savingsApy = '2.00%';
  const estimatedMonthlyInterest = '$8.67';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        {/* Hero */}
        <section className="rounded-2xl border bg-card p-8 md:p-10 mb-8">
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

        {/* Account cards */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Your accounts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spending Account - Result card style */}
            <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-foreground/80 mb-2">
                <Wallet className="h-4 w-4" />
                {branding.walletName}
              </div>
              <div className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums">
                {spendingBalance}
              </div>
              <p className="text-sm text-primary-foreground/80 mt-3">
                Your everyday spending account with no fees.
              </p>
              <Link
                href="/dashboard/spending"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-4 py-2 text-sm font-bold hover:bg-background/90 transition-colors"
              >
                View account
              </Link>
            </div>

            {/* Savings Account */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <PiggyBank className="h-4 w-4" />
                  {branding.savingsName}
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">{savingsApy} APY</span>
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums">
                {savingsBalance}
              </div>
              <div className="mt-3 rounded-xl bg-card border p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Est. monthly interest</span>
                <span className="text-sm font-bold text-primary">{estimatedMonthlyInterest}</span>
              </div>
              <Link
                href="/dashboard/savings"
                className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold hover:bg-foreground hover:text-background transition-colors"
              >
                View savings
              </Link>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionTile
              href="/dashboard/spending"
              title="Move money"
              desc="Transfer between Spending and Savings."
              icon={<ArrowRightLeft className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/payer"
              title="Add money"
              desc={`Deposit from your ${branding.funderShortLabel.toLowerCase()}.`}
              icon={<ArrowDownToLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/transfers"
              title={branding.payoutVerb}
              desc={`Send to a ${branding.payeeSingular.toLowerCase()}.`}
              icon={<ArrowUpFromLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payer"
              title="Settings"
              desc="Auto-Save, notifications, and more."
              icon={<Settings className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            At a glance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={branding.walletName} value={spendingBalance} icon={<Wallet className="h-4 w-4" />} />
            <StatCard label={branding.savingsName} value={savingsBalance} icon={<PiggyBank className="h-4 w-4" />} />
            <StatCard label="APY earned" value={savingsApy} icon={<TrendingUp className="h-4 w-4" />} />
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
            <h2 className="text-xl font-extrabold tracking-tight">Features</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to manage your money.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/spending"
              title={branding.walletName}
              desc="Your everyday account for spending and payments."
            />
            <ModuleTile
              href="/dashboard/savings"
              title={branding.savingsName}
              desc="Earn 2.00% APY and grow your savings automatically."
            />
            <ModuleTile
              href="/dashboard/transfers"
              title={branding.payoutNounPlural}
              desc={`Move money to a ${branding.payeeSingular.toLowerCase()}.`}
            />
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc={`Manage banks and debit cards you ${branding.payoutVerb.toLowerCase()} to.`}
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Activity"
              desc="See all your transactions and transfers."
            />
            <ModuleTile
              href="/dashboard/payer"
              title="Settings"
              desc={`Profile, ${branding.funderShortLabel.toLowerCase()}, and Auto-Save settings.`}
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
          : 'bg-card hover:border-foreground hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          primary ? 'bg-background text-foreground' : 'bg-primary/15 text-primary'
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
      className="group block rounded-xl border p-5 transition-all bg-background hover:border-foreground hover:shadow-md"
    >
      <h3 className="font-extrabold tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
        Open →
      </div>
    </Link>
  );
}
