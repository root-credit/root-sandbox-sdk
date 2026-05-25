'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownToLine, Wallet } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PayoutForm } from '@/components/PayoutForm';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { formatMoney } from '@/lib/types/payments';

export default function CashOutPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const payerId = session?.payerId ?? null;
  const { payees, isLoading, error, refresh } = usePayees(payerId);
  const { walletBalanceCents } = useDomainStore();

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader email={session.payerEmail} />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Cash out</h1>
            <p className="text-muted-foreground mt-1">
              Withdraw funds from your {branding.walletName} to your linked bank account.
            </p>
          </div>

          {/* Wallet summary */}
          <section className="rounded-lg bg-primary text-primary-foreground p-6 mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-primary-foreground/70 mb-2">
                <Wallet className="h-3.5 w-3.5" />
                Available to withdraw
              </div>
              <div className="text-4xl font-bold tabular-nums">
                {walletBalanceCents == null ? '—' : formatMoney(walletBalanceCents)}
              </div>
              <p className="text-sm text-primary-foreground/80 mt-2 max-w-md">
                Your {branding.walletName}. Withdrawals are processed to your linked bank account.
              </p>
            </div>
            <Link
              href="/dashboard/payer"
              className="rounded-full bg-background/20 text-primary-foreground px-5 h-11 text-sm font-semibold inline-flex items-center hover:bg-background/30 transition-colors"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Manage bank account
            </Link>
          </section>

          {error && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive mb-6">
              {error}
            </div>
          )}

          <section className="rounded-lg border border-border bg-background p-6 mb-6">
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground py-10 font-medium">
                Loading...
              </div>
            ) : (
              <PayoutForm payerId={session.payerId} payees={payees} onSuccess={refresh} />
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="How it works"
              title="Withdraw to your bank"
              items={[
                'Select your linked bank account',
                'Enter the amount to withdraw',
                `Press confirm — ${branding.productName} processes the transfer`,
                'Funds arrive in 1-2 business days',
              ]}
              ordered
            />
            <InfoCard
              label="Good to know"
              title="Withdrawal tips"
              items={[
                'No fees for bank withdrawals',
                'Link your bank account first in Account settings',
                'Minimum withdrawal amount: $1.00',
                'Track all withdrawals in Transactions',
              ]}
            />
          </div>
        </main>
      </div>
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
    <div className="rounded-lg border border-border bg-background p-5">
      <p className="text-xs font-medium text-primary mb-2">{label}</p>
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      {ordered ? (
        <ol className="space-y-2.5 text-sm text-foreground">
          {items.map((it, i) => (
            <li key={it} className="flex items-start gap-3">
              <span className="text-xs mt-0.5 text-primary tabular-nums font-medium">
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
