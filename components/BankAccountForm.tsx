'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const bankAccountSchema = z.object({
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountType: z.enum(['checking', 'savings']),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  restaurantId: string;
  onSuccess?: () => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-surface text-foreground rounded-md border border-neutral-200 ' +
  'placeholder:text-neutral-400 transition-smooth ' +
  'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-bright/25';

const labelClass =
  'block text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2';

export function BankAccountForm({ restaurantId, onSuccess }: BankAccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountType: 'checking',
    },
  });

  async function onSubmit(data: BankAccountFormData) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/restaurant/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          restaurantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link bank account');
      }

      setSuccess('Bank account linked successfully!');
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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
          placeholder="Restaurant name"
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
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-ink text-white text-sm font-medium tracking-tight hover:bg-ink-soft transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-sm-custom hover:shadow-md-custom"
      >
        {isLoading ? (
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
