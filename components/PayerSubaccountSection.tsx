'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { branding } from '@/lib/branding';
import { useFundSubaccountPayin, usePayerSubaccountToggle } from '@/lib/hooks/usePayer';
import {
  fundSubaccountPayinInputSchema,
  type FundSubaccountPayinInput,
} from '@/lib/types/fund';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  payerId: string;
  payerName: string;
  subaccountId?: string;
  hasLinkedBank: boolean;
};

export function PayerSubaccountSection({
  payerId,
  payerName,
  subaccountId,
  hasLinkedBank,
}: Props) {
  const router = useRouter();
  const subaccountEnabled = Boolean(subaccountId);
  const { enableSubaccount, disableSubaccount, isSubmitting: toggleBusy } =
    usePayerSubaccountToggle();
  const { fundPayin, isSubmitting: payinBusy } = useFundSubaccountPayin();
  const { refreshWallet } = useDomainStore();

  const defaultSubaccountName = `${payerName} · ${branding.walletName}`.slice(
    0,
    128,
  );

  async function handleToggle(enable: boolean) {
    if (toggleBusy) return;
    try {
      if (enable) {
        await enableSubaccount(payerId, defaultSubaccountName);
        toast.success(`${branding.walletName} enabled`);
      } else {
        await disableSubaccount(payerId);
        toast.success(`${branding.walletName} disabled for this profile`);
      }
      router.refresh();
      // Pull fresh balance from Root after the account state changes
      await refreshWallet();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FundSubaccountPayinInput>({
    resolver: zodResolver(fundSubaccountPayinInputSchema),
    defaultValues: {
      amount: 10,
      rail: 'standard_ach',
    },
  });

  async function onPayinSubmit(data: FundSubaccountPayinInput) {
    try {
      const result = await fundPayin(payerId, data);
      toast.success(
        `Deposit started — ${result.rail} (${result.payinId.slice(0, 8)}…)`,
      );
      reset({ amount: data.amount, rail: data.rail });
      router.refresh();
      // Re-fetch live balance from Root once the deposit lands
      await refreshWallet();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deposit failed');
    }
  }

  return (
    <Card className="mb-6 rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold tracking-tight">{branding.walletName}</CardTitle>
        <CardDescription>
          Your in-app balance for everyday spending, moving money to savings, and {branding.payoutVerb.toLowerCase()}-ing
          to your {branding.payeePlural.toLowerCase()}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold">Enable {branding.walletName}</p>
            <p className="text-xs text-muted-foreground">
              Activates your spending account for deposits and transfers.
            </p>
          </div>
          <ToggleSwitch
            checked={subaccountEnabled}
            disabled={toggleBusy}
            onCheckedChange={handleToggle}
          />
        </div>

        {subaccountEnabled && subaccountId ? (
          <div className="rounded-xl border bg-background px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Account ID
            </p>
            <p className="font-mono text-xs break-all text-muted-foreground">{subaccountId}</p>
          </div>
        ) : null}

        {subaccountEnabled ? (
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
            <div>
              <p className="text-sm font-bold">Add money (ACH deposit)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pull funds from your {branding.funderLabel.toLowerCase()} into your {branding.walletName} using{' '}
                <code className="rounded bg-card border px-1 py-0.5 text-[11px]">standard_ach</code>{' '}
                or{' '}
                <code className="rounded bg-card border px-1 py-0.5 text-[11px]">
                  same_day_ach
                </code>
                .
              </p>
            </div>

            {!hasLinkedBank ? (
              <p className="text-sm font-semibold text-amber-700">
                Link your {branding.funderShortLabel.toLowerCase()} above before adding money.
              </p>
            ) : (
              <form onSubmit={handleSubmit(onPayinSubmit)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="payin-amount">Amount (USD)</Label>
                    <Input
                      id="payin-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register('amount', { valueAsNumber: true })}
                      className="font-mono"
                    />
                    {errors.amount ? (
                      <p className="text-xs text-destructive">{errors.amount.message}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="payin-rail">ACH type</Label>
                    <select
                      id="payin-rail"
                      {...register('rail')}
                      className={cn(
                        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      )}
                    >
                      <option value="standard_ach">standard_ach</option>
                      <option value="same_day_ach">same_day_ach</option>
                    </select>
                    {errors.rail ? (
                      <p className="text-xs text-destructive">{errors.rail.message}</p>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={payinBusy}
                  className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {payinBusy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding money…
                    </>
                  ) : (
                    'Add money'
                  )}
                </Button>
              </form>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-8 w-14 shrink-0 rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-input',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-7 w-7 rounded-full bg-background shadow-md ring-0 transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
