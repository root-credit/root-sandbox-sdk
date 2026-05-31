'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useCryptoStore, SPOT_PRICES } from '@/components/CryptoStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { formatMoney } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ASSETS = ['BTC', 'ETH', 'SOL', 'USDC'] as const;
type Asset = (typeof ASSETS)[number];

export default function BuyPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { walletEnabled, walletBalanceCents, isWalletLoading, addHolding, refreshWallet } = useCryptoStore();

  const [selectedAsset, setSelectedAsset] = useState<Asset>('BTC');
  const [usdAmount, setUsdAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);

  if (!session) return null;

  const spotInfo = SPOT_PRICES[selectedAsset];
  const usdCents = Math.round(parseFloat(usdAmount || '0') * 100);
  const cryptoAmount = spotInfo ? usdCents / spotInfo.priceCents : 0;
  const balanceCents = walletBalanceCents ?? 0;
  const canBuy = walletEnabled && usdCents > 0 && usdCents <= balanceCents;

  async function handleBuy() {
    if (!canBuy || isBuying) return;
    setIsBuying(true);
    try {
      // Optimistically update local state (no server crypto ledger in this demo)
      addHolding({
        symbol: selectedAsset,
        name: spotInfo.name,
        amountCrypto: cryptoAmount,
        costBasisCents: usdCents,
        currentPriceCents: spotInfo.priceCents,
      });
      await refreshWallet();
      toast.success(`Bought ${cryptoAmount.toFixed(6)} ${selectedAsset} for ${formatMoney(usdCents)}`);
      setUsdAmount('');
    } catch {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 lg:px-10 py-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">Portfolio</Link>
          <span>/</span>
          <span className="text-foreground font-bold">Buy</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Buy crypto</h1>
          <p className="text-base text-muted-foreground mt-2 max-w-xl">
            Purchase crypto from your {branding.walletName}. Prices are mocked for the sandbox.
          </p>
        </div>

        {/* Wallet balance bar */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{branding.walletName}</p>
            <p className="text-2xl font-extrabold font-mono tabular-nums">
              {isWalletLoading ? '…' : walletEnabled ? (walletBalanceCents != null ? formatMoney(walletBalanceCents) : '—') : 'Not enabled'}
            </p>
          </div>
          {!walletEnabled && (
            <Link href="/dashboard/payer" className="text-sm font-bold text-primary hover:underline">
              Enable wallet →
            </Link>
          )}
        </div>

        {/* Asset selector */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Select asset</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {ASSETS.map((asset) => {
              const info = SPOT_PRICES[asset];
              const active = selectedAsset === asset;
              return (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    active ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold text-sm">{asset}</div>
                  <div className="text-xs text-muted-foreground">{info.name}</div>
                  <div className="font-mono font-bold text-xs mt-1 text-primary">{formatMoney(info.priceCents)}</div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="usd-amount">Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
              <Input
                id="usd-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                className="pl-7 font-mono"
              />
            </div>
          </div>

          {usdCents > 0 && (
            <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">You receive</p>
                <p className="text-2xl font-extrabold font-mono mt-1">
                  {cryptoAmount.toFixed(6)} <span className="text-primary">{selectedAsset}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  1 {selectedAsset} = {formatMoney(spotInfo.priceCents)} (mocked)
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-none" />
            </div>
          )}

          <Button
            onClick={handleBuy}
            disabled={!canBuy || isBuying}
            className="w-full mt-5 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base"
          >
            <TrendingUp className="h-4 w-4" />
            {isBuying ? 'Buying…' : !walletEnabled ? 'Enable wallet first' : usdCents > balanceCents ? 'Insufficient balance' : `Buy ${selectedAsset}`}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Prices are mocked. No real transactions occur in this sandbox.
        </p>
      </main>
    </div>
  );
}
