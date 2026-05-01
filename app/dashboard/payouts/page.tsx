'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpFromLine } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PayoutForm } from '@/components/PayoutForm';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import { useListingStore } from '@/components/ListingStoreProvider';
import { formatMoney } from '@/lib/types/payments';

export default function CashOutPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const payerId = session?.payerId ?? null;
  const { payees, isLoading, error, refresh } = usePayees(payerId);
  const { walletBalanceCents } = useListingStore();

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 lg:px-10 py-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">
            Console
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold">{branding.payoutNounPlural}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{branding.payoutNounPlural}</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Move funds out of your {branding.productName} wallet to a {branding.payeeSingular.toLowerCase()} —
              bank or debit card.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-4 py-2 text-xs font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Rail live
          </span>
        </div>

        {/* Wallet summary */}
        <section className="rounded-2xl border-2 bg-foreground text-background p-6 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-background/60 mb-2">
              <ArrowUpFromLine className="h-3.5 w-3.5" />
              Available to {branding.payoutVerb.toLowerCase()}
            </div>
            <div className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums">
              {walletBalanceCents == null ? '—' : formatMoney(walletBalanceCents)}
            </div>
            <p className="text-sm text-background/70 mt-2 max-w-md">
              Your {branding.productName} wallet balance. {branding.payoutNoun} requests pull from this balance.
            </p>
          </div>
          <Link
            href="/dashboard/payees"
            className="rounded-full bg-primary text-primary-foreground px-5 h-11 text-sm font-bold inline-flex items-center hover:bg-primary/90 transition-colors"
          >
            Manage {branding.payeePlural.toLowerCase()}
          </Link>
        </section>

        {error && (
          <div className="rounded-xl border-2 border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive mb-6">
            {error}
          </div>
        )}

        <section className="rounded-2xl border-2 bg-card p-6 mb-6">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-10 font-semibold">
              Loading {branding.payeePlural.toLowerCase()}…
            </div>
          ) : (
            <PayoutForm payerId={session.payerId} payees={payees} onSuccess={refresh} />
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            label="How it works"
            title={`From wallet to ${branding.funderShortLabel.toLowerCase()}`}
            items={[
              `Pick the ${branding.payeeSingular.toLowerCase()} you're sending to`,
              `Enter the amount to ${branding.payoutVerb.toLowerCase()}`,
              `Press process — ${branding.productName} routes the transfer`,
              'Receipts and ledger entries write automatically',
            ]}
            ordered
          />
          <InfoCard
            label="Quick tips"
            title={`Run a clean ${branding.payoutNoun.toLowerCase()}`}
            items={[
              `Settles in roughly 5 seconds per ${branding.payeeSingular.toLowerCase()}`,
              `${branding.payeeSingular} payment methods must be linked first`,
              `Funds pull from your ${branding.productName} wallet balance`,
              'Audit everything in Activity',
            ]}
          />
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  label,
  title,
  items,
  ordered,
}: {
  label: string;
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 bg-card p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{label}</p>
      <h3 className="font-extrabold tracking-tight text-lg mb-4">{title}</h3>
      {ordered ? (
        <ol className="space-y-2.5 text-sm text-foreground">
          {items.map((it, i) => (
            <li key={it} className="flex items-start gap-3">
              <span className="font-mono text-xs mt-0.5 text-primary tabular-nums font-bold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="leading-snug">{it}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2 text-sm text-foreground">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-none" />
              <span className="leading-snug">{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
