'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { branding } from '@/lib/branding';
import { useCreatePayee } from '@/lib/hooks/useCreatePayee';
import { PaymentMethodType } from '@/lib/types/payments';
import type { CreatePayeeInput } from '@/lib/types/payee';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
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
        !!data.cardNumber &&
        !!data.expiryMonth &&
        !!data.expiryYear &&
        !!data.cvv &&
        !!data.cardholderName
      );
    },
    { message: 'Required payment method fields are missing' }
  );

type FormData = z.infer<typeof formSchema>;

interface PayeeFormProps {
  payerId: string;
  onSuccess?: () => void;
}

export function PayeeForm({ payerId, onSuccess }: PayeeFormProps) {
  const { createPayee, isSubmitting } = useCreatePayee();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
    const input: CreatePayeeInput =
      data.paymentMethodType === PaymentMethodType.BankAccount
        ? {
            name: data.name,
            email: data.email,
            phone: data.phone,
            paymentMethodType: PaymentMethodType.BankAccount,
            accountNumber: data.accountNumber!,
            routingNumber: data.routingNumber!,
            accountType: data.accountType,
          }
        : {
            name: data.name,
            email: data.email,
            phone: data.phone,
            paymentMethodType: PaymentMethodType.DebitCard,
            cardNumber: data.cardNumber!,
            expiryMonth: data.expiryMonth!,
            expiryYear: data.expiryYear!,
            cvv: data.cvv,
            cardholderName: data.cardholderName,
          };

    try {
      await createPayee(payerId, input);
      toast.success(`${branding.payeeSingular} added successfully`);
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Identity */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {branding.payeeSingular} information
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input {...register('name')} type="text" id="name" placeholder="John Doe" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input {...register('email')} type="email" id="email" placeholder="john@example.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input {...register('phone')} type="tel" id="phone" placeholder="(555) 123-4567" />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Rail selection */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payout rail</p>
        <div className="grid grid-cols-2 gap-3">
          <RadioCard
            id="rail-bank"
            value={PaymentMethodType.BankAccount}
            register={register('paymentMethodType')}
            checked={currentPaymentType === PaymentMethodType.BankAccount}
            title="Bank account"
            desc="ACH or instant bank rail"
          />
          <RadioCard
            id="rail-card"
            value={PaymentMethodType.DebitCard}
            register={register('paymentMethodType')}
            checked={currentPaymentType === PaymentMethodType.DebitCard}
            title="Debit card"
            desc="Instant card push"
          />
        </div>
      </div>

      {/* Bank details */}
      {currentPaymentType === PaymentMethodType.BankAccount && (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bank details</p>
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
      )}

      {/* Card details */}
      {currentPaymentType === PaymentMethodType.DebitCard && (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Card details</p>
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding {branding.payeeSingular.toLowerCase()}…
          </>
        ) : (
          `Add ${branding.payeeSingular.toLowerCase()}`
        )}
      </Button>
    </form>
  );
}

function RadioCard({
  id,
  value,
  register,
  checked,
  title,
  desc,
}: {
  id: string;
  value: string;
  register: ReturnType<ReturnType<typeof useForm>['register']>;
  checked: boolean;
  title: string;
  desc: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
        checked
          ? 'border-primary bg-primary/5'
          : 'border-input hover:bg-muted/30'
      )}
    >
      <input type="radio" id={id} value={value} {...register} className="sr-only" />
      <span className="flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 flex-none rounded-full border-2 transition-colors',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground/30'
        )}
      />
    </label>
  );
}
