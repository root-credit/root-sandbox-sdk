'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Wallet, ArrowRight, Plus } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import { useWallet } from '@/components/WalletContext';
import { branding } from '@/lib/branding';
import { formatMoney, dollarsToCents } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CURRENCY_PAIRS = [
  { to: 'USD', rate: 1.00, flag: '🇺🇸', country: 'United States' },
  { to: 'EUR', rate: 0.92, flag: '🇪🇺', country: 'Eurozone' },
  { to: 'INR', rate: 83.42, flag: '🇮🇳', country: 'India' },
  { to: 'GBP', rate: 0.79, flag: '🇬🇧', country: 'United Kingdom' },
];

export default function TransfersPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { walletBalanceCents, walletEnabled } = useDomainStore();
  const { balance: walletBalance, executeTransfer } = useWallet();
  const payerId = session?.payerId ?? null;
  const { payees, isLoading: payeesLoading } = usePayees(payerId);

  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_PAIRS[0]);
  const [selectedPayee, setSelectedPayee] = useState<string>('');

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const isUsdToUsd = selectedCurrency.to === 'USD';
  const fee = isUsdToUsd ? 0 : Math.round(amountNum * 0.0075 * 100) / 100; // 0.75% fee, $0 for USD
  const amountToConvert = amountNum - fee;
  const receivedAmount = Math.round(amountToConvert * selectedCurrency.rate * 100) / 100;
  const canSend = walletEnabled && amountNum > 0 && amountNum <= balance / 100 && selectedPayee;

  async function handleSendMoney() {
    if (!canSend) return;
    
    const payee = payees.find(p => p.id === selectedPayee);
    if (!payee) {
      toast.error('Please select a recipient.');
      return;
    }

    // Insufficient funds check (sentAmount + fee)
    const totalDeduction = amountNum + fee;
    if (totalDeduction > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    // Execute transfer - updates balance and logs transaction
    executeTransfer({
      recipientName: payee.name,
      fromCurrency: 'USD',
      toCurrency: selectedCurrency.to,
      sentAmount: amountNum,
      receivedAmount: receivedAmount,
      exchangeRate: selectedCurrency.rate,
      fee: fee,
    });

    toast.success(
      `Transfer of $${amountNum.toFixed(2)} to ${payee.name} completed. ` +
      `They received ${receivedAmount.toFixed(2)} ${selectedCurrency.to}.`
    );
    setAmount('');
    setSelectedPayee('');
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader email={session.payerEmail} />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{branding.payoutVerb} money</h1>
            <p className="text-muted-foreground mt-1">
              Send money to your {branding.payeePlural.toLowerCase()} in 80+ countries.
            </p>
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                    className="pl-8 pr-16 h-14 text-2xl tabular-nums"
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
                <div className="mb-6 rounded-lg bg-[#F4F4F4] p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Fee {isUsdToUsd ? '' : '(0.75%)'}</span>
                    <span className="font-medium text-foreground">
                      {isUsdToUsd ? '$0.00 USD' : `- $${fee.toFixed(2)} USD`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Exchange rate</span>
                    <span className="font-medium text-foreground">
                      1 USD = {selectedCurrency.rate.toFixed(2)} {selectedCurrency.to}
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

              {/* Received amount display - Teal for FX, White for USD */}
              {amount && amountNum > 0 && (
                <div 
                  className="mb-6 rounded-lg p-4"
                  style={isUsdToUsd 
                    ? { backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0' }
                    : { backgroundColor: '#00D9C6' }
                  }
                >
                  <div 
                    className="text-xs font-medium mb-1"
                    style={{ color: isUsdToUsd ? '#6B7280' : '#003D36' }}
                  >
                    Recipient gets {isUsdToUsd && '— should arrive in seconds'}
                  </div>
                  <div 
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: isUsdToUsd ? '#1E1E1E' : '#003D36' }}
                  >
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
                  <div className="rounded-lg border border-border bg-[#F4F4F4] p-4 text-center">
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
              {/* Balance card */}
              <div className="rounded-lg border border-border bg-background p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs font-medium">{branding.walletName}</span>
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {!walletEnabled
                    ? 'Not enabled'
                    : walletBalanceCents == null
                      ? '—'
                      : formatMoney(walletBalanceCents)}
                </div>
                <Link
                  href="/dashboard/payer"
                  className="mt-3 text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  Add money <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

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
            </div>
          </div>
        </main>
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
