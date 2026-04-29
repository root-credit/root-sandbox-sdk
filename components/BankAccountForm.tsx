'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branding } from '@/lib/branding';
import { useLinkBank } from '@/lib/hooks/usePayer';
import { linkBankInputSchema, type LinkBankInput } from '@/lib/types/payer';

interface BankAccountFormProps {
  payerId: string;
  onSuccess?: () => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-surface text-foreground rounded-md border border-neutral-200 ' +
  'placeholder:text-neutral-400 transition-smooth ' +
  'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-bright/25';

const labelClass =
  'block text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="px-4 py-3 bg-error-soft border border-error/20 rounded-md text-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 bg-success-soft border border-success/20 rounded-md text-success text-sm">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="accountHolderName" className={labelClass}>
          Account holder name
        </label>
        <input
          {...register('accountHolderName')}
          type="text"
          id="accountHolderName"
          placeholder={`${branding.payerSingular} name`}
          className={inputClass}
        />
        {errors.accountHolderName && (
          <p className="text-error text-xs mt-1.5">{errors.accountHolderName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="routingNumber" className={labelClass}>
            Routing number
          </label>
          <input
            {...register('routingNumber')}
            type="text"
            id="routingNumber"
            placeholder="123456789"
            maxLength={9}
            className={`${inputClass} font-mono-tab`}
          />
          {errors.routingNumber && (
            <p className="text-error text-xs mt-1.5">{errors.routingNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="accountNumber" className={labelClass}>
            Account number
          </label>
          <input
            {...register('accountNumber')}
            type="password"
            id="accountNumber"
            placeholder="••••••••"
            className={`${inputClass} font-mono-tab`}
          />
          {errors.accountNumber && (
            <p className="text-error text-xs mt-1.5">{errors.accountNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="accountType" className={labelClass}>
          Account type
        </label>
        <select {...register('accountType')} id="accountType" className={inputClass}>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-ink text-white text-sm font-medium tracking-tight hover:bg-ink-soft transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-sm-custom hover:shadow-md-custom"
      >
        {isSubmitting ? (
          <>
            <Spinner /> Linking account…
          </>
        ) : (
          <>
            Link bank account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
