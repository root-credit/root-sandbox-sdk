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

  const defaultSubaccountName = `${payerName} · ${branding.productName} GAG wallet`.slice(
    0,
    128,
  );

  async function handleToggle(enable: boolean) {
    if (toggleBusy) return;
    try {
      if (enable) {
        await enableSubaccount(payerId, defaultSubaccountName);
        toast.success('Good as Gold wallet enabled');
      } else {
        await disableSubaccount(payerId);
        toast.success('Good as Gold wallet disabled for this profile');
      }
      router.refresh();
      // Pull fresh balance (incoming - outgoing) from Root after the wallet
      // (subaccount) state changes; client cache stays in sync with the server.
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
        `Top-up started — ${result.rail} (${result.payinId.slice(0, 8)}…)`,
      );
      reset({ amount: data.amount, rail: data.rail });
      router.refresh();
      // Re-fetch live wallet balance from Root once the payin lands. Root reports
      // `incoming` and `outgoing` totals on the subaccount; we never cache the
      // derived balance, so a fresh GET is the only source of truth.
      await refreshWallet();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payin failed');
    }
  }

  return (
    <Card className="mb-6 rounded-2xl border-2">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold tracking-tight">Good as Gold wallet</CardTitle>
        <CardDescription>
          Your in-app balance for buying domains, receiving sales, and {branding.payoutVerb.toLowerCase()}-ing
          to your {branding.payeePlural.toLowerCase()}. Powered by a Root subaccount.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-xl border-2 bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold">Enable Good as Gold wallet</p>
            <p className="text-xs text-muted-foreground">
              Provisions a Root subaccount to back your wallet balance and ACH payins.
            </p>
          </div>
          <ToggleSwitch
            checked={subaccountEnabled}
            disabled={toggleBusy}
            onCheckedChange={handleToggle}
          />
        </div>

        {subaccountEnabled && subaccountId ? (
          <div className="rounded-xl border-2 bg-background px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Wallet (subaccount) ID
            </p>
            <p className="font-mono text-xs break-all text-muted-foreground">{subaccountId}</p>
          </div>
        ) : null}

        {subaccountEnabled ? (
          <div className="flex flex-col gap-4 rounded-xl border-2 bg-secondary p-4">
            <div>
              <p className="text-sm font-bold">Top up GAG wallet (ACH pull)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pull funds from your {branding.funderLabel.toLowerCase()} into your wallet using{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">standard_ach</code>{' '}
                or{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  same_day_ach
                </code>
                .
              </p>
            </div>

            {!hasLinkedBank ? (
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Link your {branding.funderShortLabel.toLowerCase()} above before topping up your wallet.
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
                    <Label htmlFor="payin-rail">ACH rail</Label>
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
                  className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90"
                >
                  {payinBusy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Topping up…
                    </>
                  ) : (
                    'Top up GAG wallet'
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
