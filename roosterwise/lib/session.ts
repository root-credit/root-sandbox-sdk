import { cookies } from 'next/headers';
import { getSession } from './redis';

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
