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
import { Home, Tag, Wallet, ArrowDownToLine, ArrowUpFromLine, Activity } from 'lucide-react';

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

  const ownedProperties = await getMyOwnedDomains();
  const ownedPropertiesCount = ownedProperties.length;
  const listedForRentCount = ownedProperties.filter((d) => d.listingPriceCents !== undefined).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        {/* Hero */}
        <section className="rounded-lg border bg-background p-8 md:p-10 mb-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground mb-5">
            {branding.productName} Dashboard
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
            {/* First Quick Action uses primary bg per color philosophy */}
            <ActionTile
              href="/dashboard/marketplace"
              title="Explore stays"
              desc="Find a property and book with your wallet."
              icon={<Home className="h-5 w-5" />}
              primary
            />
            <ActionTile
              href="/dashboard/domains"
              title="List a property"
              desc="Set a nightly rate and start hosting."
              icon={<Tag className="h-5 w-5" />}
            />
            <ActionTile
              href="/dashboard/payer"
              title="Top up wallet"
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
            {/* Wallet card uses primary bg per color philosophy */}
            <WalletStatCard label={branding.walletName} value={walletLabel} icon={<Wallet className="h-4 w-4" />} />
            <StatCard label="My properties" value={String(ownedPropertiesCount)} icon={<Home className="h-4 w-4" />} />
            <StatCard label="Listed for rent" value={String(listedForRentCount)} icon={<Tag className="h-4 w-4" />} />
            <StatCard
              label={branding.payoutNounPlural}
              value="$0.00"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Module tiles */}
        <section className="rounded-lg border bg-background overflow-hidden">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">Features</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything you need to host and travel.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleTile
              href="/dashboard/marketplace"
              title="Explore stays"
              desc="Browse properties listed by other hosts."
            />
            <ModuleTile
              href="/dashboard/domains"
              title="My Properties"
              desc="See what you own. List or unlist any property."
            />
            <ModuleTile
              href="/dashboard/payouts"
              title={branding.payoutNounPlural}
              desc={`Move wallet funds to a ${branding.payeeSingular.toLowerCase()}.`}
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

/** Wallet stat card - uses primary bg per color philosophy */
function WalletStatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg bg-primary text-primary-foreground p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-extrabold font-mono tabular-nums">{value}</div>
    </div>
  );
}

/** Regular stat card - white bg with border */
function StatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border bg-background p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-extrabold font-mono tabular-nums text-foreground">{value}</div>
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
          : 'bg-background hover:border-primary hover:shadow-md'
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
            primary ? 'text-primary-foreground/75' : 'text-muted-foreground'
          }`}
        >
          {desc}
        </p>
      </div>
      <div
        className={`mt-auto text-xs font-bold uppercase tracking-widest ${
          primary ? 'text-primary-foreground/75' : 'text-foreground'
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
      className="group block rounded-lg border p-5 transition-all bg-background hover:border-primary hover:shadow-md"
    >
      <h3 className="font-extrabold tracking-tight mb-1.5 text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
        Open →
      </div>
    </Link>
  );
}
