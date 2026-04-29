'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branding } from '@/lib/branding';
import { useSignup } from '@/lib/hooks/useAuth';
import {
  signupPayerInputSchema,
  type SignupPayerInput,
} from '@/lib/types/payer';

const inputClass =
  'w-full px-3.5 py-2.5 bg-surface text-foreground rounded-md border border-neutral-200 ' +
  'placeholder:text-neutral-400 transition-smooth ' +
  'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-bright/25';

const labelClass =
  'block text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2';

export function SignupForm() {
  const router = useRouter();
  const { signup, isSubmitting } = useSignup();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupPayerInput>({
    resolver: zodResolver(signupPayerInputSchema),
  });

  async function onSubmit(data: SignupPayerInput) {
    setError('');
    try {
      await signup(data);
      router.push('/dashboard');
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

      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder={`admin@${branding.payerSingular.toLowerCase()}.com`}
          className={inputClass}
        />
        {errors.email && (
          <p className="text-error text-xs mt-1.5">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="payerName" className={labelClass}>
          {branding.payerSingular} name
        </label>
        <input
          {...register('payerName')}
          type="text"
          id="payerName"
          placeholder={`My ${branding.payerSingular}`}
          className={inputClass}
        />
        {errors.payerName && (
          <p className="text-error text-xs mt-1.5">{errors.payerName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone Number
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

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          autoComplete="new-password"
          placeholder="Choose a password (min 8 characters)"
          className={inputClass}
        />
        {errors.password && (
          <p className="text-error text-xs mt-1.5">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-ink text-white text-sm font-medium tracking-tight hover:bg-ink-soft transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-sm-custom hover:shadow-md-custom"
      >
        {isSubmitting ? (
          <>
            <Spinner /> Creating account…
          </>
        ) : (
          <>
            Create account
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
