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
    <div className="min-h-screen flex flex-col bg-canvas">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 max-w-full px-6 lg:px-0 py-12">
        <section className="mb-16 px-0 lg:px-10 max-w-7xl mx-auto">
          <p className="text-caption text-body-muted mb-3 uppercase tracking-wide">Operator Console</p>
          <h1 className="text-hero-display text-balance">
            {branding.consoleHeading}
          </h1>
          <p className="text-body text-body-muted mt-4 max-w-2xl">
            {branding.consoleSubheading}
          </p>
        </section>

        <section className="mb-16 bg-surface-dark-1 -mx-6 lg:mx-0 px-6 lg:px-10 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatTile label="Active Locations" value="0" />
              <StatTile label="Total Settled" value="$0.00" accent />
              <StatTile label="Transactions" value="0" />
            </div>
          </div>
        </section>

        <section className="px-0 lg:px-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-caption text-body-muted mb-2 uppercase tracking-wide">Core Operations</p>
            <h2 className="text-display-md">Manage multi-location payouts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <Card variant={accent ? "utility" : "light"} className="p-6">
      <div className="flex flex-col">
        <p className="text-caption text-body-muted mb-3">{label}</p>
        <p className={`text-display-md ${accent ? 'text-blue-primary' : 'text-ink'}`}>
          {value}
        </p>
      </div>
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
      <Card 
        variant={primary ? "dark-1" : "utility"}
        className={`group p-6 cursor-pointer transition-all hover:shadow-md ${
          primary ? 'hover:bg-surface-dark-2' : 'hover:bg-neutral-100'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <span
              className={`inline-flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0 ${
                primary ? 'bg-white/10 text-blue-on-dark' : 'bg-canvas-parchment text-blue-primary'
              }`}
            >
              {icon}
            </span>
            <Badge variant="secondary" className={primary ? 'bg-white/10 text-white text-micro-legal' : 'text-micro-legal'}>
              {code}
            </Badge>
          </div>
          <h3 className={`text-body-strong mb-2 ${primary ? 'text-body-on-dark' : 'text-ink'}`}>
            {title}
          </h3>
          <p className={`text-body mb-6 flex-grow ${primary ? 'text-body-on-dark/80' : 'text-body-muted'}`}>
            {desc}
          </p>
          <div className={`inline-flex items-center gap-1.5 text-button-utility transition-all ${
            primary ? 'text-blue-on-dark group-hover:gap-2.5' : 'text-blue-primary group-hover:gap-2.5'
          }`}>
            Open
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
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
