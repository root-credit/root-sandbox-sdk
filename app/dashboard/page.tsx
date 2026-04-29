import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
          <StatTile label={`Active ${branding.payeePlural.toLowerCase()}`} value="0" />
          <StatTile label="Total paid out" value="$0.00" accent />
          <StatTile label="Transactions" value="0" />
        </section>

        <Card className="gap-0 bg-surface py-0 shadow-sm-custom ring-neutral-200">
          <CardHeader className="border-b border-neutral-200 pb-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-eyebrow mb-2">Modules</p>
                <h2 className="font-display text-2xl tracking-tightest">Run the house</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ModuleTile
                href="/dashboard/payouts"
                code="PAY"
                title="Process payouts"
                desc={`Run an end-of-shift ${branding.payoutNoun.toLowerCase()} and settle in seconds.`}
                icon={<IconBolt />}
                primary
              />
              <ModuleTile
                href="/dashboard/payees"
                code="TEAM"
                title={branding.payeePlural}
                desc={`Add ${branding.payeePlural.toLowerCase()} and link bank accounts or debit cards.`}
                icon={<IconUsers />}
              />
              <ModuleTile
                href="/dashboard/transactions"
                code="LDG"
                title="Transactions"
                desc="Audit every payout: amounts, status, latency."
                icon={<IconLedger />}
              />
              <ModuleTile
                href="/dashboard/payer"
                code="HSE"
                title={branding.payerSingular}
                desc={`${branding.payerSingular} profile and ACH funding source.`}
                icon={<IconBuilding />}
              />
            </div>
          </CardContent>
        </Card>
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
    <Card className="relative gap-0 overflow-hidden bg-surface py-0 shadow-sm-custom ring-neutral-200">
      <CardContent className="relative overflow-hidden p-5">
        <div className="text-eyebrow">{label}</div>
        <div
          className={`font-display text-3xl mt-2 tracking-tightest ${
            accent ? 'text-gold' : 'text-ink'
          }`}
        >
          {value}
        </div>
        {accent && (
          <div
            aria-hidden
            className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(212,160,23,0.18), transparent 70%)',
            }}
          />
        )}
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
    <Link
      href={href}
      className={`group relative block rounded-lg border transition-smooth overflow-hidden p-5 hover:-translate-y-0.5 hover:shadow-lg-custom ${
        primary
          ? 'bg-ink text-white border-ink hover:bg-ink-soft'
          : 'bg-surface text-foreground border-neutral-200 hover:border-ink'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${
            primary ? 'bg-white/10 text-gold-bright' : 'bg-neutral-100 text-ink'
          }`}
        >
          {icon}
        </span>
        <span
          className={`text-[10px] tracking-[0.18em] uppercase ${
            primary ? 'text-white/50' : 'text-neutral-400'
          }`}
        >
          {code}
        </span>
      </div>
      <h3 className="font-display text-xl tracking-tightest mb-1.5">{title}</h3>
      <p
        className={`text-sm leading-relaxed ${
          primary ? 'text-white/65' : 'text-neutral-500'
        }`}
      >
        {desc}
      </p>
      <div
        className={`mt-5 inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase ${
          primary ? 'text-gold-bright' : 'text-neutral-500 group-hover:text-ink'
        } transition-smooth`}
      >
        Open
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6" strokeLinecap="round" />
    </svg>
  );
}
