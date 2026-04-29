import { cookies } from 'next/headers';
import { getSession } from './redis';

/** Compare session payer id with id from URL/body (handles casing / stray whitespace). */
export function sessionOwnsPayer(
  session: { payerId: string } | null | undefined,
  payerId: string | null | undefined,
): boolean {
  if (!session?.payerId || payerId == null) return false;
  return (
    session.payerId.trim().toLowerCase() === payerId.trim().toLowerCase()
  );
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await getSession(sessionToken);
  return session;
}

/** Convenience: minimal payer identity (just IDs); fetch full record from Redis when needed. */
export async function getCurrentPayerIdentity() {
  const session = await getCurrentSession();
  if (!session) return null;
  return {
    id: session.payerId,
    payerEmail: session.payerEmail,
  };
}
