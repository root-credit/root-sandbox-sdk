'use client';

/**
 * useSession — read the current operator session.
 *
 * v0 / LLM contract:
 *   - This is the ONLY way client components should read the session.
 *   - Returns `null` while loading; `undefined` on error / no session.
 */

import { useEffect, useState } from 'react';

export interface OperatorSession {
  merchantId: string;
  merchantEmail: string;
}

export function useSession(): {
  session: OperatorSession | null | undefined;
  isLoading: boolean;
  error: string | null;
} {
  const [session, setSession] = useState<OperatorSession | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/session');
        if (!res.ok) {
          if (!cancelled) setSession(undefined);
          return;
        }
        const data = (await res.json()) as OperatorSession;
        if (!cancelled) setSession(data);
      } catch (err) {
        if (!cancelled) {
          setSession(undefined);
          setError(err instanceof Error ? err.message : 'Session load failed');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { session, isLoading, error };
}
