import { cookies } from 'next/headers';
import { getSession } from './redis';

/** Compare session merchant id with id from URL/body (handles casing / stray whitespace). */
export function sessionOwnsMerchant(
  session: { merchantId: string } | null | undefined,
  merchantId: string | null | undefined,
): boolean {
  if (!session?.merchantId || merchantId == null) return false;
  return (
    session.merchantId.trim().toLowerCase() === merchantId.trim().toLowerCase()
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

/** Convenience: minimal merchant identity (just IDs); fetch full record from Redis when needed. */
export async function getCurrentMerchantIdentity() {
  const session = await getCurrentSession();
  if (!session) return null;
  return {
    id: session.merchantId,
    merchantEmail: session.merchantEmail,
  };
}
