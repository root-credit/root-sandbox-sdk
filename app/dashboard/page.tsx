import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-12">
        <section className="mb-12">
          <p className="text-eyebrow mb-3">Operator console</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tightest text-balance">
            {branding.consoleHeading}
          </h1>
          <p className="text-neutral-500 mt-3 max-w-xl">
            {branding.consoleSubheading}
          </p>
        </section>

        <section className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Active Locations" value="0" />
          <StatTile label="Total Settled" value="$0.00" accent />
          <StatTile label="Transactions" value="0" />
        </section>

        <section>
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-eyebrow mb-2">Core Operations</p>
              <h2 className="font-display text-2xl tracking-tightest">Manage multi-location payouts</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModuleTile
              href="/dashboard/payouts"
              code="TIP"
              title="Tip Settlements"
              desc="Distribute and settle tips across all locations in real time."
              icon={<IconCoins />}
              primary
            />
            <ModuleTile
              href="/dashboard/payees"
              code="STAFF"
              title="Service Staff"
              desc="Manage payout details for all staff across your venues."
              icon={<IconUtensils />}
            />
            <ModuleTile
              href="/dashboard/transactions"
              code="LDG"
              title="Settlement Ledger"
              desc="Complete transaction history and settlement verification."
              icon={<IconLedger />}
            />
            <ModuleTile
              href="/dashboard/payer"
              code="LOC"
              title="Locations & Fund"
              desc="Manage operating accounts and multi-location settings."
              icon={<IconBuilding2 />}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? 'border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800' : ''}>
      <CardHeader className="pb-3">
        <CardDescription className={accent ? 'text-amber-700 dark:text-amber-300' : ''}>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`font-display text-3xl tracking-tightest ${
          accent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-50'
        }`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleTile({
  href,
  code,
  title,
  desc,
  icon,
  primary,
}: {
  href: string;
  code: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className={`group cursor-pointer transition-all hover:shadow-lg hover:border-slate-400 ${
        primary
          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-800'
          : 'hover:border-slate-400'
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${
                primary ? 'bg-white/10 text-amber-400' : 'bg-slate-100 text-slate-900 dark:bg-slate-800'
              }`}
            >
              {icon}
            </span>
            <Badge variant="secondary" className={primary ? 'bg-white/10 text-white' : ''}>
              {code}
            </Badge>
          </div>
          <CardTitle className={primary ? 'text-white' : 'text-slate-900 dark:text-slate-50'}>{title}</CardTitle>
          <CardDescription className={primary ? 'text-white/70' : ''}>{desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            primary ? 'text-amber-400' : 'text-slate-600 dark:text-slate-400'
          } group-hover:gap-2.5 transition-all`}>
            Open
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h7l-1 8 11-12h-7l0-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCoins() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="12" r="1" />
      <path d="M8 7v10" strokeLinecap="round" />
      <path d="M12 7c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 7v10" strokeLinecap="round" />
      <circle cx="16" cy="12" r="1" />
    </svg>
  );
}
function IconUtensils() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" strokeLinecap="round" />
      <path d="M19 2c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h0" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v11" strokeLinecap="round" />
      <path d="M8 20h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLedger() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h12" strokeLinecap="round" />
    </svg>
  );
}
function IconBuilding2() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
