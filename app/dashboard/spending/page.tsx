'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Wallet, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { formatMoney, dollarsToCents } from '@/lib/types/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SpendingAccountPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { walletBalanceCents, walletEnabled, isWalletLoading } = useDomainStore();
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveAmount, setMoveAmount] = useState('');
  const [moveDirection, setMoveDirection] = useState<'to-savings' | 'from-savings'>('to-savings');
  const [moveBusy, setMoveBusy] = useState(false);

  if (!session) return null;

  const balance = walletBalanceCents ?? 0;
  const balanceLabel = !walletEnabled && !isWalletLoading
    ? 'Not enabled'
    : walletBalanceCents == null
      ? '—'
      : formatMoney(walletBalanceCents);

  // Mocked savings balance
  const savingsBalanceCents = 520000;
  const savingsBalance = formatMoney(savingsBalanceCents);

  function openMoveDialog(direction: 'to-savings' | 'from-savings') {
    setMoveDirection(direction);
    setMoveAmount('');
    setMoveDialogOpen(true);
  }

  async function handleMove() {
    if (moveBusy) return;
    const dollars = parseFloat(moveAmount);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    const cents = dollarsToCents(dollars);
    
    if (moveDirection === 'to-savings' && cents > balance) {
      toast.error('Insufficient balance in Spending Account.');
      return;
    }
    if (moveDirection === 'from-savings' && cents > savingsBalanceCents) {
      toast.error('Insufficient balance in Savings Account.');
      return;
    }

    setMoveBusy(true);
    // Mocked transfer - in real app this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (moveDirection === 'to-savings') {
      toast.success(`Moved ${formatMoney(cents)} to ${branding.savingsName}.`);
    } else {
      toast.success(`Moved ${formatMoney(cents)} to ${branding.walletName}.`);
    }
    
    setMoveBusy(false);
    setMoveDialogOpen(false);
    setMoveAmount('');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here={branding.walletName} />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{branding.walletName}</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Your everyday spending account. No monthly fees, no minimums, and get paid up to 2 days early.
            </p>
          </div>
        </div>

        {/* Balance card - Result card style */}
        <section className="rounded-2xl bg-primary text-primary-foreground p-6 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-foreground/80 mb-2">
            <Wallet className="h-4 w-4" />
            Available balance
          </div>
          <div className="text-5xl md:text-6xl font-extrabold font-mono tabular-nums">
            {isWalletLoading ? '…' : balanceLabel}
          </div>
          <p className="text-sm text-primary-foreground/80 mt-3">
            Fee-free overdraft up to $200 with qualifying direct deposits.
          </p>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => openMoveDialog('to-savings')}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left hover:border-foreground transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight">Move to Savings</div>
              <p className="text-sm text-muted-foreground">Transfer to grow your savings</p>
            </div>
          </button>

          <button
            onClick={() => openMoveDialog('from-savings')}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left hover:border-foreground transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight">Move from Savings</div>
              <p className="text-sm text-muted-foreground">Transfer to Spending</p>
            </div>
          </button>

          <Link
            href="/dashboard/transfers"
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left hover:border-foreground transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ArrowUpFromLine className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight">{branding.payoutVerb}</div>
              <p className="text-sm text-muted-foreground">Send to linked bank or card</p>
            </div>
          </Link>
        </section>

        {/* Account details */}
        <section className="rounded-2xl border bg-card p-6 mb-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4">Account details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Account type
              </p>
              <p className="font-bold">{branding.walletName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Monthly fee
              </p>
              <p className="font-bold">$0.00</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Minimum balance
              </p>
              <p className="font-bold">None required</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Fee-free ATMs
              </p>
              <p className="font-bold">60,000+ nationwide</p>
            </div>
          </div>
        </section>

        {/* Savings preview */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold tracking-tight">{branding.savingsName}</h2>
            <Link
              href="/dashboard/savings"
              className="text-sm font-bold text-primary hover:underline"
            >
              View →
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Balance
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums">{savingsBalance}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                APY
              </p>
              <p className="text-2xl font-extrabold text-primary">2.00%</p>
            </div>
          </div>
        </section>
      </main>

      {/* Move money dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              Move money
            </DialogTitle>
            <DialogDescription>
              {moveDirection === 'to-savings'
                ? `Transfer from ${branding.walletName} to ${branding.savingsName}.`
                : `Transfer from ${branding.savingsName} to ${branding.walletName}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="move-amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  $
                </span>
                <Input
                  id="move-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="100.00"
                  value={moveAmount}
                  onChange={(e) => setMoveAmount(e.target.value)}
                  className="pl-7 font-mono"
                  disabled={moveBusy}
                />
              </div>
            </div>
            <div className="rounded-xl bg-card border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">From</span>
                <span className="font-bold">
                  {moveDirection === 'to-savings' ? branding.walletName : branding.savingsName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">To</span>
                <span className="font-bold">
                  {moveDirection === 'to-savings' ? branding.savingsName : branding.walletName}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setMoveDialogOpen(false)}
              className="rounded-full font-bold"
              disabled={moveBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={moveBusy}
              className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {moveBusy ? 'Moving…' : 'Move money'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Breadcrumb({ here }: { here: string }) {
  return (
    <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
      <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">
        Dashboard
      </Link>
      <span>/</span>
      <span className="text-foreground font-bold">{here}</span>
    </nav>
  );
}
