'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { branding } from '@/lib/branding';
import { useSignup } from '@/lib/hooks/useAuth';
import {
  signupPayerInputSchema,
  type SignupPayerInput,
} from '@/lib/types/payer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          {...register('email')}
          type="email"
          id="email"
          placeholder={`admin@${branding.payerSingular.toLowerCase()}.com`}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="payerName">{branding.payerSingular} name</Label>
        <Input
          {...register('payerName')}
          type="text"
          id="payerName"
          placeholder={`My ${branding.payerSingular}`}
        />
        {errors.payerName && (
          <p className="text-xs text-destructive">{errors.payerName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          {...register('phone')}
          type="tel"
          id="phone"
          placeholder="(555) 123-4567"
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}
