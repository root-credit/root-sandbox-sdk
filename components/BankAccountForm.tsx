'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { branding } from '@/lib/branding';
import { useLinkBank } from '@/lib/hooks/usePayer';
import { linkBankInputSchema, type LinkBankInput } from '@/lib/types/payer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface BankAccountFormProps {
  payerId: string;
  onSuccess?: () => void;
}

const labelTone = 'text-eyebrow normal-case tracking-[0.14em]';

const selectTriggerClass =
  'bg-transparent px-2.5 py-1 text-sm md:text-sm';

export function BankAccountForm({ payerId, onSuccess }: BankAccountFormProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { linkBank, isSubmitting } = useLinkBank();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LinkBankInput>({
    resolver: zodResolver(linkBankInputSchema),
    defaultValues: { accountType: 'checking' },
  });

  async function onSubmit(data: LinkBankInput) {
    setError('');
    setSuccess('');
    try {
      await linkBank(payerId, data);
      setSuccess('Bank account linked successfully!');
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      <FieldGroup className="gap-5">
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

        <Field data-invalid={!!errors.accountHolderName}>
          <FieldLabel htmlFor="accountHolderName" className={labelTone}>
            Account holder name
          </FieldLabel>
          <FieldContent>
            <Input
              {...register('accountHolderName')}
              type="text"
              id="accountHolderName"
              placeholder={`${branding.payerSingular} name`}
              aria-invalid={!!errors.accountHolderName}
            />
            <FieldError errors={[errors.accountHolderName]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4">
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
              <FieldError errors={[errors.routingNumber]} />
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
              <FieldError errors={[errors.accountNumber]} />
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

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-md shadow-sm-custom hover:shadow-md-custom"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Linking account…
            </>
          ) : (
            <>
              Link bank account
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
