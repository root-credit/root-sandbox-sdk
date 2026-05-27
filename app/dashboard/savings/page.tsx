'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PiggyBank, ArrowRightLeft, TrendingUp, Settings } from 'lucide-react';
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

export default function SavingsAccountPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { walletBalanceCents, walletEnabled } = useDomainStore();
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveAmount, setMoveAmount] = useState('');
  const [moveDirection, setMoveDirection] = useState<'to-spending' | 'from-spending'>('from-spending');
  const [moveBusy, setMoveBusy] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  if (!session) return null;

  // Mocked savings data
  const savingsBalanceCents = 520000;
  const savingsBalance = formatMoney(savingsBalanceCents);
  const savingsApy = '2.00%';
  const estimatedMonthlyInterest = '$8.67';
  const estimatedYearlyInterest = '$104.00';
  const spendingBalance = walletBalanceCents ?? 0;

  function openMoveDialog(direction: 'to-spending' | 'from-spending') {
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
    
    if (moveDirection === 'to-spending' && cents > savingsBalanceCents) {
      toast.error('Insufficient balance in Savings Account.');
      return;
    }
    if (moveDirection === 'from-spending' && cents > spendingBalance) {
      toast.error('Insufficient balance in Spending Account.');
      return;
    }

    setMoveBusy(true);
    // Mocked transfer - in real app this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (moveDirection === 'to-spending') {
      toast.success(`Moved ${formatMoney(cents)} to ${branding.walletName}.`);
    } else {
      toast.success(`Moved ${formatMoney(cents)} to ${branding.savingsName}.`);
    }
    
    setMoveBusy(false);
    setMoveDialogOpen(false);
    setMoveAmount('');
  }

  function toggleAutoSave() {
    setAutoSaveEnabled(!autoSaveEnabled);
    if (!autoSaveEnabled) {
      toast.success('Auto-Save enabled. Round-ups will be saved automatically.');
    } else {
      toast.success('Auto-Save disabled.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here={branding.savingsName} />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{branding.savingsName}</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Earn 2.00% APY on your savings. No minimum balance, no monthly fees.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/15 text-primary px-4 py-2 text-xs font-bold uppercase tracking-widest">
            <TrendingUp className="h-3.5 w-3.5" />
            {savingsApy} APY
          </div>
        </div>

        {/* Balance card */}
        <section className="rounded-2xl border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            <PiggyBank className="h-4 w-4" />
            Savings balance
          </div>
          <div className="text-5xl md:text-6xl font-extrabold font-mono tabular-nums">
            {savingsBalance}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-primary p-4 text-primary-foreground">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80">
                Est. monthly interest
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums mt-1">
                {estimatedMonthlyInterest}
              </p>
            </div>
            <div className="rounded-xl bg-primary p-4 text-primary-foreground">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80">
                Est. yearly interest
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums mt-1">
                {estimatedYearlyInterest}
              </p>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => openMoveDialog('from-spending')}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left hover:border-foreground transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight">Add to Savings</div>
              <p className="text-sm text-muted-foreground">Transfer from Spending Account</p>
            </div>
          </button>

          <button
            onClick={() => openMoveDialog('to-spending')}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left hover:border-foreground transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight">Move to Spending</div>
              <p className="text-sm text-muted-foreground">Transfer to Spending Account</p>
            </div>
          </button>
        </section>

        {/* Auto-Save settings */}
        <section className="rounded-2xl border bg-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-extrabold tracking-tight">Auto-Save</h2>
                <p className="text-sm text-muted-foreground">
                  Automatically round up purchases and save the difference.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={autoSaveEnabled}
              onCheckedChange={toggleAutoSave}
            />
          </div>
          {autoSaveEnabled && (
            <div className="mt-4 rounded-xl bg-primary/10 p-4">
              <p className="text-sm text-foreground">
                Auto-Save is active. Every purchase will be rounded up to the nearest dollar, 
                and the difference will be automatically transferred to your savings.
              </p>
            </div>
          )}
        </section>

        {/* Spending preview */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold tracking-tight">{branding.walletName}</h2>
            <Link
              href="/dashboard/spending"
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
              <p className="text-2xl font-extrabold font-mono tabular-nums">
                {walletEnabled ? formatMoney(spendingBalance) : 'Not enabled'}
              </p>
            </div>
            <Button
              onClick={() => openMoveDialog('from-spending')}
              className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add to savings
            </Button>
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
              {moveDirection === 'to-spending'
                ? `Transfer from ${branding.savingsName} to ${branding.walletName}.`
                : `Transfer from ${branding.walletName} to ${branding.savingsName}.`}
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
                  {moveDirection === 'to-spending' ? branding.savingsName : branding.walletName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">To</span>
                <span className="font-bold">
                  {moveDirection === 'to-spending' ? branding.walletName : branding.savingsName}
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

function ToggleSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-input'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-background shadow-md ring-0 transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
