'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowDownToLine } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useCryptoStore, SPOT_PRICES } from '@/components/CryptoStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SellPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { walletEnabled, walletBalanceCents, isWalletLoading, holdings, removeHolding, refreshWallet } = useCryptoStore();

  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  if (!session) return null;

  const selectedHolding = holdings.find((h) => h.symbol === selectedSymbol);
  const spotInfo = selectedSymbol ? SPOT_PRICES[selectedSymbol] : null;
  const cryptoAmt = parseFloat(cryptoAmount || '0');
  const usdCents = spotInfo ? Math.round(cryptoAmt * spotInfo.priceCents) : 0;
  const canSell = walletEnabled && selectedHolding && cryptoAmt > 0 && cryptoAmt <= selectedHolding.amountCrypto;

  async function handleSell() {
    if (!canSell || isSelling || !selectedHolding) return;
    setIsSelling(true);
    try {
      removeHolding(selectedSymbol, cryptoAmt);
      await refreshWallet();
      toast.success(`Sold ${cryptoAmt} ${selectedSymbol} for ${formatMoney(usdCents)}. Added to your ${branding.walletName}.`);
      setCryptoAmount('');
    } catch {
      toast.error('Sale failed. Please try again.');
    } finally {
      setIsSelling(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 lg:px-10 py-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">Portfolio</Link>
          <span>/</span>
          <span className="text-foreground font-bold">Sell</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Sell crypto</h1>
          <p className="text-base text-muted-foreground mt-2 max-w-xl">
            Convert your holdings back to USD in your {branding.walletName}.
          </p>
        </div>

        {/* Wallet balance */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{branding.walletName}</p>
            <p className="text-2xl font-extrabold font-mono tabular-nums">
              {isWalletLoading ? '…' : walletEnabled ? (walletBalanceCents != null ? formatMoney(walletBalanceCents) : '—') : 'Not enabled'}
            </p>
          </div>
        </div>

        {/* Holdings */}
        {holdings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
              <ArrowDownToLine className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-extrabold">No crypto holdings</p>
              <p className="text-sm text-muted-foreground mt-1">Buy some crypto first, then come back to sell.</p>
            </div>
            <Link
              href="/dashboard/buy"
              className="rounded-full bg-primary text-primary-foreground px-5 h-11 inline-flex items-center font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              Buy crypto →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Your holdings</Label>
              <div className="grid grid-cols-1 gap-3">
                {holdings.map((h) => {
                  const spot = SPOT_PRICES[h.symbol];
                  const currentValue = spot ? Math.round(h.amountCrypto * spot.priceCents) : 0;
                  const active = selectedSymbol === h.symbol;
                  return (
                    <button
                      key={h.symbol}
                      onClick={() => { setSelectedSymbol(h.symbol); setCryptoAmount(''); }}
                      className={`rounded-xl border p-4 text-left transition-all flex items-center justify-between gap-4 ${
                        active ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-primary/50'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{h.symbol} <span className="text-muted-foreground font-normal text-sm">— {h.name}</span></div>
                        <div className="font-mono text-sm mt-0.5 text-muted-foreground">{h.amountCrypto.toFixed(6)} {h.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{formatMoney(currentValue)}</div>
                        <div className="text-xs text-muted-foreground">@ {formatMoney(spot?.priceCents ?? 0)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedHolding && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="crypto-amount">Amount to sell ({selectedSymbol})</Label>
                <Input
                  id="crypto-amount"
                  type="number"
                  step="0.000001"
                  min="0"
                  max={selectedHolding.amountCrypto}
                  placeholder="0.000000"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  className="font-mono"
                />
                <button
                  type="button"
                  onClick={() => setCryptoAmount(selectedHolding.amountCrypto.toFixed(6))}
                  className="text-xs text-primary font-bold hover:underline text-left"
                >
                  Sell all ({selectedHolding.amountCrypto.toFixed(6)} {selectedSymbol})
                </button>

                {usdCents > 0 && (
                  <div className="rounded-xl bg-accent/10 border border-accent/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">You receive</p>
                    <p className="text-2xl font-extrabold font-mono mt-1 text-accent">{formatMoney(usdCents)} USD</p>
                    <p className="text-xs text-muted-foreground mt-1">Added to your {branding.walletName}</p>
                  </div>
                )}

                <Button
                  onClick={handleSell}
                  disabled={!canSell || isSelling}
                  className="w-full mt-2 rounded-full font-bold bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base"
                >
                  {isSelling ? 'Selling…' : `Sell ${selectedSymbol} for ${formatMoney(usdCents)}`}
                </Button>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-6">
          Prices are mocked. No real transactions occur in this sandbox.
        </p>
      </main>
    </div>
  );
}
