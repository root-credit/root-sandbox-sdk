import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Banknote,
  Users,
} from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { WalletHeroBalance, WalletStatCard } from '@/components/WalletStats';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        {/* Hero */}
        <section className="rounded-3xl border-2 bg-secondary p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" aria-hidden />
          <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-accent/40 blur-3xl" aria-hidden />

          <div className="relative">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              {branding.productName} console
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-balance leading-[1.05] max-w-3xl">
              {branding.consoleHeading}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              {branding.consoleSubheading}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <WalletHeroBalance />
              <Link
                href="/dashboard/payouts"
                className="group flex flex-1 items-center justify-between rounded-2xl border-2 bg-card px-5 py-4 hover:border-foreground transition-colors"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Next action
                  </div>
                  <div className="text-base font-extrabold">Run weekly payroll</div>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground group-hover:translate-x-1 transition-transform" />
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
              href="/dashboard/payouts"
              title="Run payroll"
              desc={`Pay your ${branding.payeePlural.toLowerCase()} their weekly amounts.`}
              icon={<ArrowUpFromLine className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/payees"
              title={`Add ${branding.payeeSingular.toLowerCase()}`}
              desc="Onboard a new team member to the roster."
              icon={<Users className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payer"
              title="Top up wallet"
              desc={`Pull funds via ACH from your ${branding.funderShortLabel.toLowerCase()}.`}
              icon={<ArrowDownToLine className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/transactions"
              title="View activity"
              desc="Audit every payroll move with full receipts."
              icon={<Activity className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Stats — static placeholders only, no data fetching on overview */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            At a glance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <WalletStatCard />
            <StatCard
              label={branding.payeePlural}
              value="0"
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="This week's payroll"
              value="$0.00"
              icon={<Banknote className="h-4 w-4" />}
            />
            <StatCard
              label={branding.payoutNounPlural}
              value="0"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-2xl border-2 bg-card overflow-hidden">
          <div className="border-b-2 px-6 py-5">
            <h2 className="text-xl font-black tracking-tight">Modules</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to run payroll on Gusto.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc="Manage your team. Add, update, and remove employees."
            />
            <ModuleTile
              href="/dashboard/payouts"
              title="Run payroll"
              desc={`Pay every ${branding.payeeSingular.toLowerCase()} from your Gusto wallet in one click.`}
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Activity"
              desc="Audit every wallet move with full receipts and statuses."
            />
            <ModuleTile
              href="/dashboard/payer"
              title="Wallet & bank"
              desc={`Profile, ${branding.funderShortLabel.toLowerCase()}, and Gusto wallet settings.`}
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
      <div className="text-3xl font-black font-mono tabular-nums">{value}</div>
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
          ? 'bg-foreground text-background border-foreground hover:bg-foreground/90'
          : 'bg-card hover:border-foreground hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          primary ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-base font-extrabold tracking-tight mb-0.5">{title}</div>
        <p
          className={`text-sm leading-snug ${
            primary ? 'text-background/75' : 'text-muted-foreground'
          }`}
        >
          {desc}
        </p>
      </div>
      <div
        className={`mt-auto inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${
          primary ? 'text-background/75' : 'text-foreground'
        }`}
      >
        Open <ArrowRight className="h-3 w-3" />
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
      <h3 className="font-black tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
        Open <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
