import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your {branding.payeePlural.toLowerCase()}, payouts, and treasury.
          </p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label={`Active ${branding.payeePlural.toLowerCase()}`} value="0" />
          <StatCard label="Total paid out" value="$0.00" />
          <StatCard label="Transactions" value="0" />
        </div>

        {/* Module tiles */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold tracking-tight">Modules</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to run operations.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModuleTile
              href="/dashboard/payouts"
              title="Process payouts"
              desc={`Run an end-of-shift ${branding.payoutNoun.toLowerCase()} and settle in seconds.`}
              primary
            />
            <ModuleTile
              href="/dashboard/payees"
              title={branding.payeePlural}
              desc={`Add ${branding.payeePlural.toLowerCase()} and link bank accounts or debit cards.`}
            />
            <ModuleTile
              href="/dashboard/transactions"
              title="Transactions"
              desc="Audit every payout: amounts, status, latency."
            />
            <ModuleTile
              href="/dashboard/payer"
              title={branding.payerSingular}
              desc={`${branding.payerSingular} profile and ACH funding source.`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function ModuleTile({
  href,
  title,
  desc,
  primary,
}: {
  href: string;
  title: string;
  desc: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-lg border p-5 transition-colors ${
        primary
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          : 'bg-card hover:bg-muted/50'
      }`}
    >
      <h3 className="font-semibold tracking-tight mb-1.5">{title}</h3>
      <p
        className={`text-sm leading-relaxed ${
          primary ? 'text-primary-foreground/75' : 'text-muted-foreground'
        }`}
      >
        {desc}
      </p>
      <div
        className={`mt-4 text-xs font-medium ${
          primary ? 'text-primary-foreground/75' : 'text-muted-foreground group-hover:text-foreground'
        } transition-colors`}
      >
        Open →
      </div>
    </Link>
  );
}
