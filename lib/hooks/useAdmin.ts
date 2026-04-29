'use client';

/**
 * Hook layer for the admin (operator-tooling) console.
 *
 * The admin endpoints under `/api/admin/*` are intentionally HTTP-only because
 * they manage the admin cookie itself (a stateless, HMAC-signed cookie that
 * can't be set from a server action without a `Set-Cookie` header on a real
 * Response). The `AdminPanel` component therefore goes through these hooks
 * rather than calling fetch itself — keeping the no-fetch-from-component rule
 * intact.
 */
import { useCallback, useState } from 'react';

export type AdminPayeeRow = {
  id: string;
  name: string;
  payerId: string;
  paymentMethodType?: string;
};

export type AdminMessage = { type: 'ok' | 'err'; text: string };

export function useAdminAuth() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'include' });
      const ok = res.ok;
      setAuthorized(ok);
      return ok;
    } catch {
      setAuthorized(false);
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || 'Login failed');
      }
      setAuthorized(true);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setAuthorized(false);
  }, []);

  return { authorized, isSubmitting, error, refresh, login, logout };
}

export function useAdminPayees() {
  const [payees, setPayees] = useState<AdminPayeeRow[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/payees', { credentials: 'include' });
    if (!res.ok) return;
    const data = (await res.json()) as { payees?: AdminPayeeRow[] };
    setPayees(data.payees ?? []);
  }, []);

  return { payees, refresh, setPayees };
}

export function useAdminOperations() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      operation: string,
      extra?: Record<string, unknown>,
    ): Promise<{ ok: boolean; message?: string }> => {
      setBusy(operation);
      setError(null);
      try {
        const res = await fetch('/api/admin/operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ operation, ...extra }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return { ok: true, message: data.message };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed';
        setError(msg);
        return { ok: false, message: msg };
      } finally {
        setBusy(null);
      }
    },
    [],
  );

  return { busy, error, run };
}
