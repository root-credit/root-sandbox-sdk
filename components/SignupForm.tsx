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
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const labelTone = 'text-eyebrow normal-case tracking-[0.14em]';

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
    <Card className="border-neutral-200/80 shadow-md-custom">
      <CardContent className="pt-6">
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

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email" className={labelTone}>
                Email Address
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder={`admin@${branding.payerSingular.toLowerCase()}.com`}
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.payerName}>
              <FieldLabel htmlFor="payerName" className={labelTone}>
                {branding.payerSingular} name
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register('payerName')}
                  type="text"
                  id="payerName"
                  placeholder={`My ${branding.payerSingular}`}
                  aria-invalid={!!errors.payerName}
                />
                <FieldError errors={[errors.payerName]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone" className={labelTone}>
                Phone Number
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

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password" className={labelTone}>
                Password
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register('password')}
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  placeholder="Choose a password (min 8 characters)"
                  aria-invalid={!!errors.password}
                />
                <FieldError errors={[errors.password]} />
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
                  Creating account…
                </>
              ) : (
                <>
                  Create account
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
      </CardContent>
    </Card>
  );
}
