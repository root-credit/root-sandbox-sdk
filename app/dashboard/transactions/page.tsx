'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity as ActivityIcon } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useSession } from '@/lib/hooks/useSession';
import {
  useCryptoWallet,
  CRYPTO_INFO,
  type CryptoTransaction,
} from '@/components/CryptoWalletProvider';
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

  const { transactions } = useCryptoWallet();

  if (!session) return null;

  function formatUSD(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatCrypto(value: number): string {
    return value.toFixed(8);
  }

  // Sort transactions by date, newest first
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalBought = transactions
    .filter((t) => t.type === 'buy')
    .reduce((sum, t) => sum + t.usdAmount, 0);

  const totalSold = transactions
    .filter((t) => t.type === 'sell')
    .reduce((sum, t) => sum + t.usdAmount, 0);

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
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Activity</h1>
          <p className="text-base text-muted-foreground mt-2 max-w-xl">
            Every buy, every sell, every transaction — written to your ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total bought" value={formatUSD(totalBought)} />
          <StatCard label="Total sold" value={formatUSD(totalSold)} />
          <StatCard label="Total transactions" value={String(transactions.length)} />
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                <ActivityIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Buy or sell some crypto to populate the ledger.
                </p>
              </div>
              <Link
                href="/dashboard/marketplace"
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-5 h-11 text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Buy crypto →
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Asset
                  </TableHead>
                  <TableHead className="text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    USD Value
                  </TableHead>
                  <TableHead className="text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Price
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    formatUSD={formatUSD}
                    formatCrypto={formatCrypto}
                  />
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
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-extrabold font-mono tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function TransactionRow({
  transaction,
  formatUSD,
  formatCrypto,
}: {
  transaction: CryptoTransaction;
  formatUSD: (v: number) => string;
  formatCrypto: (v: number) => string;
}) {
  const isBuy = transaction.type === 'buy';
  return (
    <TableRow className="border-border">
      <TableCell className="text-muted-foreground text-xs font-semibold">
        {new Date(transaction.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </TableCell>
      <TableCell>
        <Badge variant={isBuy ? 'default' : 'secondary'} className="font-bold">
          {isBuy ? 'Buy' : 'Sell'}
        </Badge>
      </TableCell>
      <TableCell className="font-bold text-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 w-12">
            {transaction.ticker}
          </span>
          <span>{CRYPTO_INFO[transaction.ticker].name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums font-bold text-foreground">
        {formatCrypto(transaction.cryptoAmount)} {transaction.ticker}
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums font-extrabold text-foreground">
        {formatUSD(transaction.usdAmount)}
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums text-muted-foreground text-xs">
        {formatUSD(transaction.price)}
      </TableCell>
      <TableCell>
        <Badge variant="success" className="font-bold">
          {transaction.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
