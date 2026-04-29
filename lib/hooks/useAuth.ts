'use client';

/**
 * useAuth — login, signup, logout for operator (payer) accounts.
 *
 * v0 / LLM contract:
 *   - Use these hooks in any auth UI; do NOT `fetch('/api/auth/*')` from components.
 *   - `useLogin` handles both payer and admin emails (the route distinguishes server-side).
 *   - On success, the session cookie is already set by the server; just navigate.
 */

import { useState } from 'react';
import type { LoginInput, SignupPayerInput } from '@/lib/types/payer';

export interface LoginOutcome {
  isAdmin: boolean;
  redirectTo: string;
  sessionToken?: string;
  payerId?: string;
}

export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: LoginInput): Promise<LoginOutcome> {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        let message = (payload as { error?: string }).error || 'Login failed';
        if (res.status === 404) {
          message += ' Create one with this email on the sign-up page.';
        }
        throw new Error(message);
      }

      const data = (await res.json()) as {
        sessionToken?: string;
        isAdmin?: boolean;
        redirectTo?: string;
        payerId?: string;
      };

      if (data.sessionToken) {
        document.cookie = `session=${data.sessionToken}; path=/; max-age=86400; SameSite=Strict`;
      }

      return {
        isAdmin: !!data.isAdmin,
        redirectTo: data.redirectTo || '/dashboard',
        sessionToken: data.sessionToken,
        payerId: data.payerId,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { login: submit, isSubmitting, error };
}

export function useSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: SignupPayerInput) {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error || 'Signup failed');
      }
      const data = (await res.json()) as {
        sessionToken?: string;
        payerId: string;
        rootPayerId: string;
      };
      if (data.sessionToken) {
        document.cookie = `session=${data.sessionToken}; path=/; max-age=86400; SameSite=Strict`;
      }
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { signup: submit, isSubmitting, error };
}

export function useLogout() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      document.cookie = 'session=; path=/; max-age=0';
    } finally {
      setIsSubmitting(false);
    }
  }

  return { logout: submit, isSubmitting };
}
