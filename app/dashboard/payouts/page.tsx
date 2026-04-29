'use client';

import { useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PayoutForm } from '@/components/PayoutForm';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import { Card, CardContent } from '@/components/ui/card';
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

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 lg:px-10 py-8">
        <div className="mb-8">
          <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Console</Link>
            <span>/</span>
            <span className="text-foreground">{branding.payoutNounPlural}</span>
          </nav>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{branding.payoutNounPlural}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Run end-of-shift {branding.payoutNounPlural.toLowerCase()} and settle in seconds.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Rail live
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                Loading {branding.payeePlural.toLowerCase()}…
              </div>
            ) : (
              <PayoutForm payerId={session.payerId} payees={payees} onSuccess={refresh} />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            label="How it works"
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
            label="Quick tips"
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
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
        <h3 className="font-semibold tracking-tight mb-4">{title}</h3>
        {ordered ? (
          <ol className="space-y-2.5 text-sm text-muted-foreground">
            {items.map((it, i) => (
              <li key={it} className="flex items-start gap-3">
                <span className="font-mono text-xs mt-0.5 text-primary tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-2.5">
                <span className="mt-2 h-1 w-1 rounded-full bg-primary flex-none" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
