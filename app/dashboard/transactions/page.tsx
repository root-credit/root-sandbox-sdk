'use client';

import { useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { centsToDollars, formatMoney } from '@/lib/types/payments';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();
  const { session } = useSession();
  const payerId = session?.payerId ?? null;
  const { transactions, isLoading, error } = useTransactions(payerId);

  useEffect(() => {
    if (session === undefined) router.push('/login');
  }, [session, router]);

  if (!session) return null;

  const totalPaidCents = transactions.reduce((sum, t) => sum + (t.amountCents ?? 0), 0);
  const successfulTransactions = transactions.filter((t) =>
    isSuccessfulPayoutStatus(t.status),
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <div className="mb-8">
          <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Console</Link>
            <span>/</span>
            <span className="text-foreground">Transactions</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every payout, every status, every receipt — written to the ledger.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total paid out" value={formatMoney(totalPaidCents)} />
          <StatCard label="Successful payouts" value={String(successfulTransactions)} />
          <StatCard label="Total transactions" value={String(transactions.length)} />
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading transactions…
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h12" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-medium">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Process your first payout to populate the ledger.
                </p>
              </div>
              <Link
                href="/dashboard/payouts"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Process your first payout →
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{branding.payeeSingular}</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.payeeName}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {transaction.payeeEmail}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-semibold">
                      ${centsToDollars(transaction.amountCents ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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

/** Root `TransferStatus` and legacy Redis labels used before live hydration. */
function isSuccessfulPayoutStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === 'settled' || s === 'completed' || s === 'success';
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const map: Record<
    string,
    { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }
  > = {
    settled: { label: 'Settled', variant: 'success' },
    completed: { label: 'Settled', variant: 'success' },
    success: { label: 'Settled', variant: 'success' },
    initiated: { label: 'Initiated', variant: 'warning' },
    processing: { label: 'Processing', variant: 'warning' },
    approved: { label: 'Approved', variant: 'warning' },
    created: { label: 'Created', variant: 'warning' },
    debited: { label: 'Debited', variant: 'warning' },
    pending: { label: 'Pending', variant: 'warning' },
    needs_review: { label: 'Needs review', variant: 'warning' },
    failed: { label: 'Failed', variant: 'destructive' },
    canceled: { label: 'Canceled', variant: 'secondary' },
  };
  const { label, variant } = map[key] ?? {
    label: status.replace(/_/g, ' '),
    variant: 'secondary' as const,
  };
  return <Badge variant={variant}>{label}</Badge>;
}
