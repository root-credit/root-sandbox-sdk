'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Transaction {
  id: string;
  workerName: string;
  workerEmail: string;
  amount: number;
  status: string;
  createdAt: number;
  completedAt: number;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        loadTransactions(sessionData.restaurantId);
      } catch (err) {
        router.push('/login');
      }
    }

    loadData();
  }, [router]);

  async function loadTransactions(restaurantId: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/payouts?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to load transactions');

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }

  if (!session) {
    return null;
  }

  const totalPaidOut = transactions.reduce((sum, t) => sum + t.amount, 0);
  const successfulTransactions = transactions.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.adminEmail} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-12">
        {/* Header */}
        <div className="mb-10">
          <Crumbs />
          <h1 className="font-display text-4xl md:text-5xl tracking-tightest mt-3">
            Transactions
          </h1>
          <p className="text-neutral-500 mt-2 max-w-md">
            Every payout, every status, every receipt — written to the ledger.
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-error-soft border border-error/20 rounded-md text-error text-sm mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatTile
            label="Total paid out"
            value={`$${(totalPaidOut / 100).toFixed(2)}`}
            accent
          />
          <StatTile
            label="Successful payouts"
            value={String(successfulTransactions)}
            tone="success"
          />
          <StatTile
            label="Total transactions"
            value={String(transactions.length)}
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-surface border border-neutral-200 rounded-lg overflow-hidden shadow-sm-custom">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-neutral-500">
              Loading transactions…
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h12" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-display text-xl tracking-tightest">No transactions yet</h3>
              <p className="text-neutral-500 mt-2 mb-6 text-sm">
                Process your first payout to populate the ledger.
              </p>
              <Link
                href="/dashboard/payouts"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-smooth"
              >
                Process your first payout
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] tracking-[0.14em] uppercase text-neutral-500 bg-neutral-100/60 border-b border-neutral-200">
                    <th className="px-6 py-3 text-left font-medium">Worker</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-neutral-150 last:border-b-0 hover:bg-neutral-50/60 transition-smooth"
                    >
                      <td className="px-6 py-4 text-sm font-medium">{transaction.workerName}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500 font-mono-tab">
                        {transaction.workerEmail}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono-tab font-semibold">
                        ${(transaction.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 font-mono-tab">
                        {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
      <span className="text-ink">Transactions</span>
    </nav>
  );
}

function StatTile({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: 'success';
}) {
  const valueColor = accent
    ? 'text-gold'
    : tone === 'success'
    ? 'text-success'
    : 'text-ink';
  return (
    <div className="relative bg-surface border border-neutral-200 rounded-lg p-5 overflow-hidden">
      <div className="text-eyebrow">{label}</div>
      <div className={`font-display text-3xl mt-2 tracking-tightest ${valueColor}`}>
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
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    completed: {
      label: 'Settled',
      cls: 'bg-success-soft border-success/20 text-success',
      dot: 'bg-success',
    },
    pending: {
      label: 'Pending',
      cls: 'bg-warning-soft border-warning/30 text-warning',
      dot: 'bg-warning',
    },
    failed: {
      label: 'Failed',
      cls: 'bg-error-soft border-error/20 text-error',
      dot: 'bg-error',
    },
  };
  const variant = map[status] ?? {
    label: status,
    cls: 'bg-neutral-100 border-neutral-200 text-neutral-500',
    dot: 'bg-neutral-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-[0.05em] font-medium border ${variant.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${variant.dot}`} />
      {variant.label}
    </span>
  );
}
