'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { TipPayoutForm } from '@/components/TipPayoutForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Worker {
  id: string;
  name: string;
}

export default function PayoutsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionResponse = await fetch('/api/session');
        if (!sessionResponse.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await sessionResponse.json();
        setSession(sessionData);
        loadWorkers(sessionData.restaurantId);
      } catch (err) {
        router.push('/login');
      }
    }

    loadData();
  }, [router]);

  async function loadWorkers(restaurantId: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workers?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to load workers');

      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workers');
    } finally {
      setIsLoading(false);
    }
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.adminEmail} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 lg:px-10 py-12">
        {/* Header */}
        <div className="mb-10">
          <Crumbs />
          <div className="flex items-end justify-between gap-6 flex-wrap mt-3">
            <div>
              <h1 className="font-display text-4xl md:text-5xl tracking-tightest">
                Tip payouts
              </h1>
              <p className="text-neutral-500 mt-2 max-w-md">
                Run end-of-shift gratuities and settle in seconds.
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

        {/* Main payout form */}
        <div className="bg-surface border border-neutral-200 rounded-lg p-8 mb-8 shadow-sm-custom">
          {isLoading ? (
            <div className="text-center text-sm text-neutral-500 py-8">
              Loading workers…
            </div>
          ) : (
            <TipPayoutForm
              restaurantId={session.restaurantId}
              workers={workers}
              onSuccess={() => setRefreshTrigger(refreshTrigger + 1)}
            />
          )}
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            eyebrow="How it works"
            title="From shift close to settled"
            items={[
              'Enter end-of-day tip amounts for your workers',
              'Press process — Roosterwise validates the totals',
              'Tips land in worker bank accounts or debit cards',
              'Receipts and ledger entries write automatically',
            ]}
            ordered
          />
          <InfoCard
            eyebrow="Quick tips"
            title="Run a clean tip-out"
            items={[
              'Settles in roughly 5 seconds per worker',
              'Worker payment methods must be linked first',
              'Funds pull from your linked restaurant bank',
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
