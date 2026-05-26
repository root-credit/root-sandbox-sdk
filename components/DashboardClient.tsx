'use client';

import Link from 'next/link';
import { Send, Wallet, Users, Globe, ArrowRight, Upload } from 'lucide-react';
import { branding } from '@/lib/branding';
import { TransferCalculator } from '@/components/TransferCalculator';
import { useWallet } from '@/components/WalletContext';

const CURRENCY_PAIRS = [
  { from: 'USD', to: 'USD', rate: '1.00', flag: '🇺🇸', label: 'Same-day transfer' },
  { from: 'USD', to: 'EUR', rate: '0.92', flag: '🇪🇺', label: 'Mid-market rate' },
  { from: 'USD', to: 'INR', rate: '83.42', flag: '🇮🇳', label: 'Mid-market rate' },
  { from: 'USD', to: 'GBP', rate: '0.79', flag: '🇬🇧', label: 'Mid-market rate' },
];

export function DashboardClient() {
  const { balance, transactions, executeTransfer } = useWallet();

  const handleTransferComplete = (transaction: {
    recipientName: string;
    fromCurrency: string;
    toCurrency: string;
    sentAmount: number;
    receivedAmount: number;
    exchangeRate: number;
    fee: number;
  }) => {
    executeTransfer(transaction);
  };

  // Calculate stats from transactions
  const totalSent = transactions.reduce((sum, t) => sum + t.sentAmount, 0);

  return (
    <>
      {/* Quick Actions Row */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/dashboard/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors"
        >
          <Send className="h-4 w-4" />
          {branding.payoutVerb}
        </Link>
        <Link
          href="/dashboard/payer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground text-sm font-semibold rounded-full border border-border hover:bg-[#F4F4F4] transition-colors"
        >
          <Wallet className="h-4 w-4" />
          Add money
        </Link>
        <Link
          href="/dashboard/payees"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground text-sm font-semibold rounded-full border border-border hover:bg-[#F4F4F4] transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Transfer Calculator */}
        <div className="lg:col-span-2">
          <TransferCalculator onTransferComplete={handleTransferComplete} />
        </div>

        {/* Right column - Balance & Stats */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="rounded-lg border border-border bg-background p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              {branding.walletName}
            </h2>
            <div className="text-3xl font-bold text-foreground tabular-nums">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href="/dashboard/payer"
                className="flex-1 text-center py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-[#F4F4F4] transition-colors"
              >
                Add money
              </Link>
              <Link
                href="/dashboard/payouts"
                className="flex-1 text-center py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-[#F4F4F4] transition-colors"
              >
                Cash out
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">{branding.payeePlural}</span>
              </div>
              <div className="text-xl font-bold text-foreground">{transactions.length > 0 ? new Set(transactions.map(t => t.recipientName)).size : 0}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Send className="h-4 w-4" />
                <span className="text-xs font-medium">{branding.payoutNounPlural}</span>
              </div>
              <div className="text-xl font-bold text-foreground">${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">Countries</span>
              </div>
              <div className="text-xl font-bold text-foreground">80+</div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rates Ticker */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">
          Today&apos;s exchange rates
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CURRENCY_PAIRS.map((pair) => (
            <div 
              key={pair.to} 
              className="rounded-lg border border-border bg-background p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{pair.flag}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {pair.from} to {pair.to}
                </span>
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground">
                {pair.rate}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {pair.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-8 rounded-lg border border-border bg-background overflow-hidden">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">Features</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Everything you need to send money abroad.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureTile
            href="/dashboard/marketplace"
            title={branding.payoutNounPlural}
            desc="Send money to your recipients in 80+ countries."
          />
          <FeatureTile
            href="/dashboard/payees"
            title={branding.payeePlural}
            desc={`Manage the people you ${branding.payoutVerb.toLowerCase()} money to.`}
          />
          <FeatureTile
            href="/dashboard/transactions"
            title="Transactions"
            desc="Track every transfer with full details."
          />
          <FeatureTile
            href="/dashboard/payer"
            title={branding.payerSingular}
            desc={`Your profile, bank account, and ${branding.walletName}.`}
          />
          <FeatureTile
            href="/dashboard/payouts"
            title="Cash out"
            desc="Withdraw balance to your linked bank account."
          />
        </div>
      </section>
    </>
  );
}

function FeatureTile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-border p-5 transition-all bg-background hover:border-primary"
    >
      <h3 className="font-semibold mb-1.5 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        <span>Open</span>
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
