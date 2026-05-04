'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity as ActivityIcon } from 'lucide-react';
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

export default function ActivityPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const payerId = session?.payerId ?? null;
  const { transactions, isLoading, error } = useTransactions(payerId);

  if (!session) return null;

  const totalPaidCents = transactions.reduce((sum, t) => sum + (t.amountCents ?? 0), 0);
  const successfulTransactions = transactions.filter((t) =>
    isSuccessfulPayoutStatus(t.status),
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">
            Console
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold">Activity</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Activity</h1>
          <p className="text-base text-muted-foreground mt-2 max-w-xl">
            Every shift {branding.payoutNoun.toLowerCase()}, every status, every receipt — written
            to your ledger in real time.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border-2 border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label={`Total ${branding.payoutVerb.toLowerCase()}`}
            value={formatMoney(totalPaidCents)}
          />
          <StatCard
            label={`Successful ${branding.payoutNounPlural.toLowerCase()}`}
            value={String(successfulTransactions)}
          />
          <StatCard label="Total events" value={String(transactions.length)} />
        </div>

        <div className="rounded-2xl border-2 bg-card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground font-semibold">
              Loading activity…
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ActivityIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-extrabold">No activity yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run your first {branding.payoutNoun.toLowerCase()} to populate the ledger.
                </p>
              </div>
              <Link
                href="/dashboard/payouts"
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 h-11 text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Run your first {branding.payoutNoun.toLowerCase()} →
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    {branding.payeeSingular}
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Email
                  </TableHead>
                  <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">
                    Amount
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Status
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-bold">{transaction.payeeName}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {transaction.payeeEmail}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-extrabold">
                      ${centsToDollars(transaction.amountCents ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-semibold">
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
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-extrabold font-mono tabular-nums">{value}</div>
    </div>
  );
}

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
  return (
    <Badge variant={variant} className="font-bold">
      {label}
    </Badge>
  );
}
