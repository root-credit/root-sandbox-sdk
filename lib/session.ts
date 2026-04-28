import { cookies } from 'next/headers';
import { getSession } from './redis';

/** Compare session restaurant id with id from URL/body (handles casing / stray whitespace). */
export function sessionOwnsRestaurant(
  session: { restaurantId: string } | null | undefined,
  restaurantId: string | null | undefined,
): boolean {
  if (!session?.restaurantId || restaurantId == null) return false;
  return (
    session.restaurantId.trim().toLowerCase() === restaurantId.trim().toLowerCase()
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

export async function getCurrentRestaurant() {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }

  // For now, return minimal data from session
  // In future, could fetch full restaurant data from Redis
  return {
    id: session.restaurantId,
    adminEmail: session.adminEmail,
  };
}
