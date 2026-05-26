'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity as ActivityIcon, Send } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { useWallet, Transaction as WalletTransaction } from '@/components/WalletContext';
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

  const { transactions } = useWallet();

  if (!session) return null;

  const totalSent = transactions.reduce((sum, t) => sum + t.sentAmount, 0);
  const completedTransfers = transactions.filter((t) => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader email={session.payerEmail} />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Track every {branding.payoutNoun.toLowerCase()}, every status, every receipt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Total sent"
              value={`$${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <StatCard
              label={`Completed ${branding.payoutNounPlural.toLowerCase()}`}
              value={String(completedTransfers)}
            />
            <StatCard label="Total transactions" value={String(transactions.length)} />
          </div>

          <div className="rounded-lg border border-border bg-background overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-16 flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F4]">
                  <ActivityIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your {branding.payoutNounPlural.toLowerCase()} will appear here.
                  </p>
                </div>
                <Link
                  href="/dashboard/marketplace"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 h-11 text-sm font-semibold hover:bg-primary/90 transition-colors"
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
                      Date
                    </TableHead>
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      Recipient
                    </TableHead>
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      From
                    </TableHead>
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      To
                    </TableHead>
                    <TableHead className="text-right font-medium text-[10px] uppercase tracking-widest">
                      Sent (USD)
                    </TableHead>
                    <TableHead className="text-right font-medium text-[10px] uppercase tracking-widest">
                      Received
                    </TableHead>
                    <TableHead className="text-right font-medium text-[10px] uppercase tracking-widest">
                      Rate
                    </TableHead>
                    <TableHead className="text-right font-medium text-[10px] uppercase tracking-widest">
                      Fee
                    </TableHead>
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground text-xs font-medium">
        <div>{transaction.date}</div>
        <div className="text-[10px] text-muted-foreground/70">{transaction.time}</div>
      </TableCell>
      <TableCell className="font-medium">
        {transaction.recipientName}
      </TableCell>
      <TableCell className="font-medium">
        {transaction.fromCurrency}
      </TableCell>
      <TableCell className="font-medium">
        {transaction.toCurrency}
      </TableCell>
      <TableCell className="text-right tabular-nums font-medium">
        ${transaction.sentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </TableCell>
      <TableCell className="text-right tabular-nums font-medium">
        {transaction.receivedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transaction.toCurrency}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground text-xs">
        {transaction.exchangeRate}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground text-xs">
        {transaction.fee === 0 ? 'Free' : `$${transaction.fee.toFixed(2)}`}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {transaction.status}
        </span>
      </TableCell>
    </TableRow>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
