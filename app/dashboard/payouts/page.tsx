'use client';

import { useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PayoutForm } from '@/components/PayoutForm';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PayoutsPage() {
  const router = useRouter();
  const { session } = useSession();
  const payerId = session?.payerId ?? null;
  const { payees, isLoading, error, refresh } = usePayees(payerId);

  useEffect(() => {
    if (session === undefined) router.push('/login');
  }, [session, router]);

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 lg:px-10 py-12">
        <div className="mb-10">
          <Crumbs />
          <div className="flex items-end justify-between gap-6 flex-wrap mt-3">
            <div>
              <h1 className="font-display text-4xl md:text-5xl tracking-tightest">
                {branding.payoutNounPlural}
              </h1>
              <p className="text-neutral-500 mt-2 max-w-md">
                Run end-of-shift {branding.payoutNounPlural.toLowerCase()} and settle in seconds.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Rail live
            </span>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-error-soft border border-error/20 rounded-md text-error text-sm mb-6">
            {error}
          </div>
        )}

        <div className="bg-surface border border-neutral-200 rounded-lg p-8 mb-8 shadow-sm-custom">
          {isLoading ? (
            <div className="text-center text-sm text-neutral-500 py-8">
              Loading {branding.payeePlural.toLowerCase()}…
            </div>
          ) : (
            <PayoutForm
              payerId={session.payerId}
              payees={payees}
              onSuccess={refresh}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            eyebrow="How it works"
            title="From shift close to settled"
            items={[
              `Enter end-of-day amounts for your ${branding.payeePlural.toLowerCase()}`,
              `Press process — ${branding.productName} validates the totals`,
              `Funds land in ${branding.payeeSingular.toLowerCase()} bank accounts or debit cards`,
              'Receipts and ledger entries write automatically',
            ]}
            ordered
          />
          <InfoCard
            eyebrow="Quick tips"
            title={`Run a clean ${branding.payoutNoun.toLowerCase()}`}
            items={[
              `Settles in roughly 5 seconds per ${branding.payeeSingular.toLowerCase()}`,
              `${branding.payeeSingular} payment methods must be linked first`,
              `Funds pull from your linked ${branding.payerSingular.toLowerCase()} bank`,
              'Audit everything in Transactions',
            ]}
          />
        </div>
      </main>
    </div>
  );
}

function Crumbs() {
  return (
    <nav className="text-[11px] tracking-[0.18em] uppercase text-neutral-400 flex items-center gap-2">
      <Link href="/dashboard" className="hover:text-ink transition-smooth">
        Console
      </Link>
      <span className="text-neutral-300">/</span>
      <span className="text-ink">Payouts</span>
    </nav>
  );
}

function InfoCard({
  eyebrow,
  title,
  items,
  ordered,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  return (
    <div className="bg-surface border border-neutral-200 rounded-lg p-6">
      <p className="text-eyebrow mb-2">{eyebrow}</p>
      <h3 className="font-display text-lg tracking-tightest mb-4">{title}</h3>
      {ordered ? (
        <ol className="space-y-2.5 text-sm text-neutral-600 leading-relaxed">
          {items.map((it, i) => (
            <li key={it} className="flex items-start gap-3">
              <span className="font-mono-tab text-[11px] mt-0.5 text-gold tracking-tight">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2 text-sm text-neutral-600 leading-relaxed">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-2.5">
              <span className="mt-2 w-1 h-1 rounded-full bg-gold flex-none" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
