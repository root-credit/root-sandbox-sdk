'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Wallet, ArrowRight, Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import { branding } from '@/lib/branding';
import { formatMoney, dollarsToCents } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CURRENCY_PAIRS = [
  { to: 'EUR', rate: 0.92, flag: '🇪🇺', country: 'Eurozone' },
  { to: 'INR', rate: 83.42, flag: '🇮🇳', country: 'India' },
  { to: 'MXN', rate: 17.24, flag: '🇲🇽', country: 'Mexico' },
  { to: 'GBP', rate: 0.79, flag: '🇬🇧', country: 'United Kingdom' },
];

export default function TransfersPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { walletBalanceCents, walletEnabled } = useDomainStore();
  const payerId = session?.payerId ?? null;
  const { payees, isLoading: payeesLoading } = usePayees(payerId);

  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_PAIRS[0]);
  const [selectedPayee, setSelectedPayee] = useState<string>('');

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const fee = Math.round(amountNum * 0.0075 * 100) / 100; // 0.75% fee
  const amountToConvert = amountNum - fee;
  const receivedAmount = Math.round(amountToConvert * selectedCurrency.rate * 100) / 100;
  const canSend = walletEnabled && amountNum > 0 && amountNum <= balance / 100 && selectedPayee;

  async function handleSendMoney() {
    if (!canSend) return;
    
    const amountCents = dollarsToCents(amountNum);
    if (amountCents > balance) {
      toast.error('Insufficient balance in your Wise Account Balance.');
      return;
    }

    const payee = payees.find(p => p.id === selectedPayee);
    if (!payee) {
      toast.error('Please select a recipient.');
      return;
    }

    toast.success(
      `Transfer initiated: ${formatMoney(amountCents)} USD to ${payee.name}. ` +
      `They will receive approximately ${receivedAmount.toFixed(2)} ${selectedCurrency.to}.`
    );
    setAmount('');
    setSelectedPayee('');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here={branding.payoutNounPlural} />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{branding.payoutVerb} money</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Send money to your {branding.payeePlural.toLowerCase()} in 80+ countries. 
              Fast, cheap, transparent.
            </p>
          </div>
          <WalletPill walletBalanceCents={walletBalanceCents} walletEnabled={walletEnabled} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer form */}
          <section className="rounded-lg border border-border bg-background p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">New transfer</h2>
            
            {/* Amount input */}
            <div className="mb-6">
              <Label htmlFor="amount" className="text-sm font-medium text-muted-foreground mb-2 block">
                You send
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 pr-16 h-14 text-2xl font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  USD
                </span>
              </div>
              {amount && amountNum > balance / 100 && (
                <p className="text-xs text-destructive mt-2">
                  Insufficient balance. You have {formatMoney(balance)} available.
                </p>
              )}
            </div>

            {/* Fee breakdown */}
            {amount && amountNum > 0 && (
              <div className="mb-6 rounded-lg bg-card p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Fee (0.75%)</span>
                  <span className="font-medium text-foreground">- ${fee.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exchange rate</span>
                  <span className="font-medium text-foreground">
                    1 USD = {selectedCurrency.rate} {selectedCurrency.to}
                  </span>
                </div>
              </div>
            )}

            {/* Currency selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Recipient gets
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {CURRENCY_PAIRS.map((currency) => (
                  <button
                    key={currency.to}
                    type="button"
                    onClick={() => setSelectedCurrency(currency)}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      selectedCurrency.to === currency.to
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary'
                    }`}
                  >
                    <span className="text-2xl">{currency.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-foreground">{currency.to}</div>
                      <div className="text-xs text-muted-foreground">{currency.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Received amount display */}
            {amount && amountNum > 0 && (
              <div className="mb-6 rounded-lg bg-primary p-4">
                <div className="text-xs font-medium text-primary-foreground/70 mb-1">
                  Recipient gets
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-primary-foreground">
                  {receivedAmount.toFixed(2)} {selectedCurrency.to}
                </div>
              </div>
            )}

            {/* Recipient selection */}
            <div className="mb-6">
              <Label htmlFor="payee" className="text-sm font-medium text-muted-foreground mb-2 block">
                {branding.payeeSingular}
              </Label>
              {payeesLoading ? (
                <div className="text-sm text-muted-foreground">Loading recipients...</div>
              ) : payees.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No {branding.payeePlural.toLowerCase()} yet
                  </p>
                  <Link
                    href="/dashboard/payees"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first {branding.payeeSingular.toLowerCase()}
                  </Link>
                </div>
              ) : (
                <select
                  id="payee"
                  value={selectedPayee}
                  onChange={(e) => setSelectedPayee(e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select a {branding.payeeSingular.toLowerCase()}</option>
                  {payees.map((payee) => (
                    <option key={payee.id} value={payee.id}>
                      {payee.name} ({payee.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Send button */}
            <Button
              onClick={handleSendMoney}
              disabled={!canSend}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:bg-muted disabled:text-muted-foreground"
            >
              <Send className="h-4 w-4 mr-2" />
              {branding.payoutVerb} {amount && amountNum > 0 ? formatMoney(dollarsToCents(amountNum)) : 'money'}
            </Button>
          </section>

          {/* Info cards */}
          <div className="space-y-4">
            <InfoCard
              title="How it works"
              items={[
                'Enter the amount you want to send in USD',
                'Choose the destination currency',
                `Select the ${branding.payeeSingular.toLowerCase()} you're sending to`,
                `Confirm and we'll handle the rest`,
              ]}
              ordered
            />
            <InfoCard
              title="Why Wise?"
              items={[
                'Always the real, mid-market exchange rate',
                'Low, transparent fees — no hidden costs',
                'Most transfers arrive in seconds',
                'Send to 80+ countries worldwide',
              ]}
            />
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Need to add money?</span>
                <Link
                  href="/dashboard/payer"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  Fund wallet <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Top up your {branding.walletName} via ACH from your linked bank account.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Breadcrumb({ here }: { here: string }) {
  return (
    <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
      <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
        Home
      </Link>
      <span>/</span>
      <span className="text-foreground font-medium">{here}</span>
    </nav>
  );
}

function WalletPill({
  walletBalanceCents,
  walletEnabled,
}: {
  walletBalanceCents: number | null;
  walletEnabled: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground pl-3 pr-5 py-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 text-primary-foreground">
        <Wallet className="h-3.5 w-3.5" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium text-primary-foreground/70">
          {branding.walletName}
        </span>
        <span className="text-base font-bold font-mono tabular-nums">
          {!walletEnabled
            ? 'Not enabled'
            : walletBalanceCents == null
              ? '—'
              : formatMoney(walletBalanceCents)}
        </span>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  items,
  ordered,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <h3 className="font-semibold tracking-tight text-foreground mb-4">{title}</h3>
      {ordered ? (
        <ol className="space-y-2.5 text-sm text-foreground">
          {items.map((it, i) => (
            <li key={it} className="flex items-start gap-3">
              <span className="font-mono text-xs mt-0.5 text-primary tabular-nums font-medium">
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
