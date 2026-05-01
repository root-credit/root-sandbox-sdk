'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  attachMyEmployeePaymentMethod,
  type AttachEmployeePaymentMethodInput,
} from '@/lib/employee-actions';
import { PaymentMethodType } from '@/lib/types/payments';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formSchema = z
  .object({
    paymentMethodType: z.enum([
      PaymentMethodType.BankAccount,
      PaymentMethodType.DebitCard,
    ]),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    accountType: z.enum(['checking', 'savings']).optional(),
    cardNumber: z.string().optional(),
    expiryMonth: z.number().optional(),
    expiryYear: z.number().optional(),
    cvv: z.string().optional(),
    cardholderName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethodType === PaymentMethodType.BankAccount) {
        return !!data.accountNumber && !!data.routingNumber;
      }
      return (
        !!data.cardNumber && !!data.expiryMonth && !!data.expiryYear && !!data.cvv
      );
    },
    { message: 'Required payment method fields are missing' },
  );

type FormData = z.infer<typeof formSchema>;

export function EmployeePaymentMethodForm({
  hasExisting,
}: {
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethodType: PaymentMethodType.BankAccount,
      accountType: 'checking',
    },
  });

  const currentPaymentType = watch('paymentMethodType');

  async function onSubmit(data: FormData) {
    const input: AttachEmployeePaymentMethodInput =
      data.paymentMethodType === PaymentMethodType.BankAccount
        ? {
            type: 'bank_account',
            accountNumber: data.accountNumber!,
            routingNumber: data.routingNumber!,
          }
        : {
            type: 'debit_card',
            cardNumber: data.cardNumber!,
            expiryMonth: data.expiryMonth!,
            expiryYear: data.expiryYear!,
          };

    setIsSubmitting(true);
    try {
      await attachMyEmployeePaymentMethod(input);
      toast.success(
        hasExisting
          ? 'Direct deposit method updated'
          : 'Direct deposit method added',
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          How do you want to be paid?
        </p>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payout rail">
          <RadioCard
            id="rail-bank"
            selected={currentPaymentType === PaymentMethodType.BankAccount}
            onSelect={() =>
              setValue('paymentMethodType', PaymentMethodType.BankAccount, {
                shouldDirty: true,
              })
            }
            title="Bank account"
            desc="ACH or instant bank rail"
          />
          <RadioCard
            id="rail-card"
            selected={currentPaymentType === PaymentMethodType.DebitCard}
            onSelect={() =>
              setValue('paymentMethodType', PaymentMethodType.DebitCard, {
                shouldDirty: true,
              })
            }
            title="Debit card"
            desc="Instant card push"
          />
        </div>
      </div>

      {currentPaymentType === PaymentMethodType.BankAccount ? (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bank details
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="routingNumber">Routing number</Label>
              <Input
                {...register('routingNumber')}
                type="text"
                id="routingNumber"
                placeholder="123456789"
                maxLength={9}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="accountNumber">Account number</Label>
              <Input
                {...register('accountNumber')}
                type="password"
                id="accountNumber"
                placeholder="••••••••"
                className="font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="accountType">Account type</Label>
            <select
              {...register('accountType')}
              id="accountType"
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Card details
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cardholderName">Cardholder name</Label>
            <Input {...register('cardholderName')} type="text" id="cardholderName" placeholder="John Doe" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cardNumber">Card number</Label>
            <Input
              {...register('cardNumber')}
              type="password"
              id="cardNumber"
              placeholder="••••••••••••••••"
              maxLength={16}
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                {...register('expiryMonth', { valueAsNumber: true })}
                type="number"
                id="expiryMonth"
                placeholder="MM"
                min={1}
                max={12}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                {...register('expiryYear', { valueAsNumber: true })}
                type="number"
                id="expiryYear"
                placeholder="YYYY"
                min={new Date().getFullYear()}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                {...register('cvv')}
                type="password"
                id="cvv"
                placeholder="•••"
                maxLength={4}
                className="font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {Object.values(errors).length > 0 ? (
        <p className="text-xs text-destructive font-semibold">
          Please complete all required fields.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-11"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : hasExisting ? (
          'Update direct deposit'
        ) : (
          'Save direct deposit'
        )}
      </Button>
    </form>
  );
}

function RadioCard({
  id,
  selected,
  onSelect,
  title,
  desc,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'relative flex w-full cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-input hover:bg-muted/30',
      )}
    >
      <span className="flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 flex-none rounded-full border-2 transition-colors',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
        )}
      />
    </button>
  );
}
