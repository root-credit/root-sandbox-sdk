'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity as ActivityIcon, Send } from 'lucide-react';
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

  const totalSentCents = transactions.reduce((sum, t) => sum + (t.amountCents ?? 0), 0);
  const successfulTransfers = transactions.filter((t) =>
    isSuccessfulPayoutStatus(t.status),
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Activity</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activity</h1>
          <p className="text-base text-muted-foreground mt-2 max-w-xl">
            Track every {branding.payoutNoun.toLowerCase()}, every status, every receipt.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label={`Total sent`}
            value={formatMoney(totalSentCents)}
          />
          <StatCard
            label={`Completed ${branding.payoutNounPlural.toLowerCase()}`}
            value={String(successfulTransfers)}
          />
          <StatCard label="Total transactions" value={String(transactions.length)} />
        </div>

        <div className="rounded-lg border border-border bg-background overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground font-medium">
              Loading activity...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card">
                <ActivityIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">No activity yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your {branding.payoutNounPlural.toLowerCase()} will appear here.
                </p>
              </div>
              <Link
                href="/dashboard/marketplace"
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 h-11 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
                {branding.payoutVerb} your first {branding.payoutNoun.toLowerCase()}
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                    {branding.payeeSingular}
                  </TableHead>
                  <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                    Email
                  </TableHead>
                  <TableHead className="text-right font-medium text-[10px] uppercase tracking-widest">
                    Amount
                  </TableHead>
                  <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.payeeName}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {transaction.payeeEmail}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-medium">
                      ${centsToDollars(transaction.amountCents ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">
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
    <div className="rounded-lg border border-border bg-background p-4 flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono tabular-nums text-foreground">{value}</div>
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
    settled: { label: 'Completed', variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
    success: { label: 'Completed', variant: 'success' },
    initiated: { label: 'Processing', variant: 'warning' },
    processing: { label: 'Processing', variant: 'warning' },
    approved: { label: 'Processing', variant: 'warning' },
    created: { label: 'Processing', variant: 'warning' },
    debited: { label: 'Processing', variant: 'warning' },
    pending: { label: 'Pending', variant: 'warning' },
    needs_review: { label: 'Needs review', variant: 'warning' },
    failed: { label: 'Failed', variant: 'destructive' },
    canceled: { label: 'Cancelled', variant: 'secondary' },
  };
  const { label, variant } = map[key] ?? {
    label: status.replace(/_/g, ' '),
    variant: 'secondary' as const,
  };
  return (
    <Badge variant={variant} className="font-medium">
      {label}
    </Badge>
  );
}
