'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const workerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  paymentMethodType: z.enum(['bank_account', 'debit_card']),
  // Bank account fields
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.enum(['checking', 'savings']).optional(),
  // Debit card fields
  cardNumber: z.string().optional(),
  expiryMonth: z.number().optional(),
  expiryYear: z.number().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethodType === 'bank_account') {
    return data.accountNumber && data.routingNumber;
  }
  if (data.paymentMethodType === 'debit_card') {
    return data.cardNumber && data.expiryMonth && data.expiryYear && data.cvv && data.cardholderName;
  }
  return false;
}, {
  message: 'Required payment method fields are missing',
});

type WorkerFormData = z.infer<typeof workerSchema>;

interface WorkerFormProps {
  restaurantId: string;
  onSuccess?: () => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-surface text-foreground rounded-md border border-neutral-200 ' +
  'placeholder:text-neutral-400 transition-smooth ' +
  'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-bright/25';

const labelClass =
  'block text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2';

const sectionEyebrow =
  'text-[11px] tracking-[0.18em] uppercase text-neutral-500 font-medium';

export function WorkerForm({ restaurantId, onSuccess }: WorkerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      paymentMethodType: 'bank_account',
      accountType: 'checking',
    },
  });

  const currentPaymentType = watch('paymentMethodType');

  async function onSubmit(data: WorkerFormData) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          restaurantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add worker');
      }

      setSuccess('Worker added successfully!');
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
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

      {/* Worker Info */}
      <fieldset className="space-y-4">
        <legend className={sectionEyebrow}>Worker information</legend>

        <div>
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="John Doe"
            className={inputClass}
          />
          {errors.name && (
            <p className="text-error text-xs mt-1.5">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="john@example.com"
              className={inputClass}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone number
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              placeholder="(555) 123-4567"
              className={inputClass}
            />
            {errors.phone && (
              <p className="text-error text-xs mt-1.5">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Payment Method Selection */}
      <fieldset className="space-y-4">
        <legend className={sectionEyebrow}>Payout rail</legend>

        <div className="grid grid-cols-2 gap-3">
          <RadioCard
            id="rail-bank"
            value="bank_account"
            register={register('paymentMethodType')}
            checked={currentPaymentType === 'bank_account'}
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
            value="debit_card"
            register={register('paymentMethodType')}
            checked={currentPaymentType === 'debit_card'}
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
      </fieldset>

      {/* Bank Account Fields */}
      {currentPaymentType === 'bank_account' && (
        <fieldset className="rounded-lg border border-neutral-200 bg-surface-2 p-5 space-y-4">
          <legend className="px-2 -ml-2 text-[11px] tracking-[0.18em] uppercase text-neutral-500">
            Bank details
          </legend>

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
            <select
              {...register('accountType')}
              id="accountType"
              className={inputClass}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        </fieldset>
      )}

      {/* Debit Card Fields */}
      {currentPaymentType === 'debit_card' && (
        <fieldset className="rounded-lg border border-neutral-200 bg-surface-2 p-5 space-y-4">
          <legend className="px-2 -ml-2 text-[11px] tracking-[0.18em] uppercase text-neutral-500">
            Card details
          </legend>

          <div>
            <label htmlFor="cardholderName" className={labelClass}>
              Cardholder name
            </label>
            <input
              {...register('cardholderName')}
              type="text"
              id="cardholderName"
              placeholder="John Doe"
              className={inputClass}
            />
            {errors.cardholderName && (
              <p className="text-error text-xs mt-1.5">{errors.cardholderName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cardNumber" className={labelClass}>
              Card number
            </label>
            <input
              {...register('cardNumber')}
              type="password"
              id="cardNumber"
              placeholder="••••••••••••••••"
              maxLength={16}
              className={`${inputClass} font-mono-tab`}
            />
            {errors.cardNumber && (
              <p className="text-error text-xs mt-1.5">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="expiryMonth" className={labelClass}>
                Expiry month
              </label>
              <input
                {...register('expiryMonth', { valueAsNumber: true })}
                type="number"
                id="expiryMonth"
                placeholder="MM"
                min={1}
                max={12}
                className={`${inputClass} font-mono-tab`}
              />
              {errors.expiryMonth && (
                <p className="text-error text-xs mt-1.5">{errors.expiryMonth.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiryYear" className={labelClass}>
                Expiry year
              </label>
              <input
                {...register('expiryYear', { valueAsNumber: true })}
                type="number"
                id="expiryYear"
                placeholder="YYYY"
                min={new Date().getFullYear()}
                className={`${inputClass} font-mono-tab`}
              />
              {errors.expiryYear && (
                <p className="text-error text-xs mt-1.5">{errors.expiryYear.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="cvv" className={labelClass}>
                CVV
              </label>
              <input
                {...register('cvv')}
                type="password"
                id="cvv"
                placeholder="•••"
                maxLength={4}
                className={`${inputClass} font-mono-tab`}
              />
              {errors.cvv && (
                <p className="text-error text-xs mt-1.5">{errors.cvv.message}</p>
              )}
            </div>
          </div>
        </fieldset>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-ink text-white text-sm font-medium tracking-tight hover:bg-ink-soft transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-sm-custom hover:shadow-md-custom"
      >
        {isLoading ? (
          <>
            <Spinner /> Adding worker…
          </>
        ) : (
          <>
            Add worker
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
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
      className={`relative flex items-start gap-3 p-4 rounded-md border cursor-pointer transition-smooth ${
        checked
          ? 'border-ink bg-neutral-100/70 shadow-sm-custom'
          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      <input
        type="radio"
        id={id}
        value={value}
        {...register}
        className="sr-only"
      />
      <span
        className={`inline-flex items-center justify-center w-9 h-9 rounded-md flex-none ${
          checked ? 'bg-ink text-gold-bright' : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-neutral-500 mt-0.5">{desc}</span>
      </span>
      <span
        className={`mt-1 w-4 h-4 rounded-full border flex-none transition-smooth ${
          checked ? 'border-ink bg-ink' : 'border-neutral-300 bg-surface'
        }`}
      >
        {checked && (
          <span className="block m-auto mt-[3px] w-2 h-2 rounded-full bg-gold-bright" />
        )}
      </span>
    </label>
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
