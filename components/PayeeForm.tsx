'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { branding } from '@/lib/branding';
import { useCreatePayee } from '@/lib/hooks/useCreatePayee';
import { PaymentMethodType } from '@/lib/types/payments';
import type { CreatePayeeInput } from '@/lib/types/payee';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

/**
 * Local React Hook Form schema. Mirrors `createPayeeInputSchema` from `lib/types/payee`
 * but flattens it for the form (RHF doesn't play well with discriminated unions).
 * The server action re-validates the canonical schema before any side effect.
 */
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

const labelTone = 'text-eyebrow normal-case tracking-[0.14em]';

const sectionEyebrow =
  'text-[11px] tracking-[0.18em] uppercase text-neutral-500 font-medium';

const selectTriggerClass =
  'bg-transparent px-2.5 py-1 text-sm md:text-sm';

export function PayeeForm({ payerId, onSuccess }: PayeeFormProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setError('');
    setSuccess('');

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
      setSuccess(`${branding.payeeSingular} added successfully!`);
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </div>
      )}

      <FieldSet className="space-y-4 border-0 p-0">
        <FieldLegend className={sectionEyebrow}>
          {branding.payeeSingular} information
        </FieldLegend>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name" className={labelTone}>
            Full name
          </FieldLabel>
          <FieldContent>
            <Input
              {...register('name')}
              type="text"
              id="name"
              placeholder="John Doe"
              aria-invalid={!!errors.name}
            />
            <FieldError errors={[errors.name]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className={labelTone}>
              Email address
            </FieldLabel>
            <FieldContent>
              <Input
                {...register('email')}
                type="email"
                id="email"
                placeholder="john@example.com"
                aria-invalid={!!errors.email}
              />
              <FieldError errors={[errors.email]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" className={labelTone}>
              Phone number
            </FieldLabel>
            <FieldContent>
              <Input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="(555) 123-4567"
                aria-invalid={!!errors.phone}
              />
              <FieldError errors={[errors.phone]} />
            </FieldContent>
          </Field>
        </div>
      </FieldSet>

      <FieldSet className="space-y-4 border-0 p-0">
        <FieldLegend className={sectionEyebrow}>Payout rail</FieldLegend>

        <div className="grid grid-cols-2 gap-3">
          <RadioCard
            id="rail-bank"
            value={PaymentMethodType.BankAccount}
            register={register('paymentMethodType')}
            checked={currentPaymentType === PaymentMethodType.BankAccount}
            title="Bank account"
            desc="ACH or instant bank rail"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V10l7-5 7 5v11M9 9h.01M15 9h.01" strokeLinecap="round" />
              </svg>
            }
          />
          <RadioCard
            id="rail-card"
            value={PaymentMethodType.DebitCard}
            register={register('paymentMethodType')}
            checked={currentPaymentType === PaymentMethodType.DebitCard}
            title="Debit card"
            desc="Instant card push"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M2 11h20" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </FieldSet>

      {currentPaymentType === PaymentMethodType.BankAccount && (
        <Card className="gap-0 border-neutral-200 bg-muted/30 py-5 shadow-none">
          <CardHeader className="px-5 pb-2 pt-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Bank details
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5 pt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.routingNumber}>
                <FieldLabel htmlFor="routingNumber" className={labelTone}>
                  Routing number
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register('routingNumber')}
                    type="text"
                    id="routingNumber"
                    placeholder="123456789"
                    maxLength={9}
                    className="font-mono-tab"
                    aria-invalid={!!errors.routingNumber}
                  />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.accountNumber}>
                <FieldLabel htmlFor="accountNumber" className={labelTone}>
                  Account number
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register('accountNumber')}
                    type="password"
                    id="accountNumber"
                    placeholder="••••••••"
                    className="font-mono-tab"
                    aria-invalid={!!errors.accountNumber}
                  />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="accountType" className={labelTone}>
                Account type
              </FieldLabel>
              <FieldContent>
                <select
                  {...register('accountType')}
                  id="accountType"
                  className={cn(
                    'flex h-8 w-full rounded-lg border border-input text-foreground outline-none transition-colors',
                    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    selectTriggerClass,
                  )}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </FieldContent>
            </Field>
          </CardContent>
        </Card>
      )}

      {currentPaymentType === PaymentMethodType.DebitCard && (
        <Card className="gap-0 border-neutral-200 bg-muted/30 py-5 shadow-none">
          <CardHeader className="px-5 pb-2 pt-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Card details
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5 pt-0">
            <Field data-invalid={!!errors.cardholderName}>
              <FieldLabel htmlFor="cardholderName" className={labelTone}>
                Cardholder name
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register('cardholderName')}
                  type="text"
                  id="cardholderName"
                  placeholder="John Doe"
                  aria-invalid={!!errors.cardholderName}
                />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.cardNumber}>
              <FieldLabel htmlFor="cardNumber" className={labelTone}>
                Card number
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register('cardNumber')}
                  type="password"
                  id="cardNumber"
                  placeholder="••••••••••••••••"
                  maxLength={16}
                  className="font-mono-tab"
                  aria-invalid={!!errors.cardNumber}
                />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field data-invalid={!!errors.expiryMonth}>
                <FieldLabel htmlFor="expiryMonth" className={labelTone}>
                  Expiry month
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register('expiryMonth', { valueAsNumber: true })}
                    type="number"
                    id="expiryMonth"
                    placeholder="MM"
                    min={1}
                    max={12}
                    className="font-mono-tab"
                    aria-invalid={!!errors.expiryMonth}
                  />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.expiryYear}>
                <FieldLabel htmlFor="expiryYear" className={labelTone}>
                  Expiry year
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register('expiryYear', { valueAsNumber: true })}
                    type="number"
                    id="expiryYear"
                    placeholder="YYYY"
                    min={new Date().getFullYear()}
                    className="font-mono-tab"
                    aria-invalid={!!errors.expiryYear}
                  />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.cvv}>
                <FieldLabel htmlFor="cvv" className={labelTone}>
                  CVV
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register('cvv')}
                    type="password"
                    id="cvv"
                    placeholder="•••"
                    maxLength={4}
                    className="font-mono-tab"
                    aria-invalid={!!errors.cvv}
                  />
                </FieldContent>
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded-md shadow-sm-custom hover:shadow-md-custom"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Adding {branding.payeeSingular.toLowerCase()}…
          </>
        ) : (
          <>
            Add {branding.payeeSingular.toLowerCase()}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
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
  icon,
}: {
  id: string;
  value: string;
  register: ReturnType<ReturnType<typeof useForm>['register']>;
  checked: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-smooth ${
        checked
          ? 'border-ink bg-neutral-100/70 shadow-sm-custom'
          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      <input type="radio" id={id} value={value} {...register} className="sr-only" />
      <span
        className={`inline-flex h-9 w-9 flex-none items-center justify-center rounded-md ${
          checked ? 'bg-ink text-gold-bright' : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-neutral-500">{desc}</span>
      </span>
      <span
        className={`mt-1 flex h-4 w-4 flex-none rounded-full border transition-smooth ${
          checked ? 'border-ink bg-ink' : 'border-neutral-300 bg-surface'
        }`}
      >
        {checked && (
          <span className="m-auto mt-[3px] block h-2 w-2 rounded-full bg-gold-bright" />
        )}
      </span>
    </label>
  );
}
