'use server';

/**
 * Authentication server actions.
 *
 * v0 / LLM contract:
 *   - Components SHOULD call these via the matching hook (e.g. `useLogin`) — NEVER `fetch('/api/...')`.
 *   - Login/signup share a single shared-app password, configured by the admin console.
 *   - The hardcoded admin email (`admin@root.credit`) is short-circuited at the route level
 *     so signup/login here apply only to merchant accounts.
 */

import { cookies } from 'next/headers';
import { generateSessionToken } from '@/lib/auth';
import { registerMerchant } from '@/lib/auth';
import { setSession, deleteSession, getMerchantByEmail } from '@/lib/redis';
import { verifySharedAppPassword } from '@/lib/app-settings';
import { HARDCODED_ADMIN_EMAIL } from '@/lib/admin-session';
import {
  loginInputSchema,
  signupMerchantInputSchema,
  type LoginInput,
  type SignupMerchantInput,
} from '@/lib/types/merchant';

const SESSION_COOKIE = 'session';
const SESSION_TTL_SEC = 86_400;

export type LoginResult = {
  success: true;
  merchantId: string;
};

export type SignupResult = {
  success: true;
  merchantId: string;
  rootPayerId: string;
};

/** Sign a merchant in. Sets the session cookie. */
export async function signIn(input: LoginInput): Promise<LoginResult> {
  const parsed = loginInputSchema.parse(input);

  if (parsed.email.trim().toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error(
      'Use the admin login route for the admin email; this action is for merchants only.'
    );
  }

  const passwordOk = await verifySharedAppPassword(parsed.password);
  if (!passwordOk) {
    throw new Error('Invalid password');
  }

  const merchant = await getMerchantByEmail(parsed.email.trim());
  if (!merchant) {
    throw new Error(
      'No account exists for this email. Sign up first, then sign in with the same email and password.'
    );
  }

  const sessionToken = generateSessionToken();
  await setSession(sessionToken, {
    merchantEmail: merchant.merchantEmail,
    merchantId: merchant.id,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  });

  return { success: true, merchantId: merchant.id };
}

/** Create a new merchant account and immediately sign it in. */
export async function signUp(input: SignupMerchantInput): Promise<SignupResult> {
  const parsed = signupMerchantInputSchema.parse(input);

  if (parsed.email.trim().toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error(
      'This email is reserved for the admin console. Use a different email to create a merchant account.'
    );
  }

  const passwordOk = await verifySharedAppPassword(parsed.password);
  if (!passwordOk) {
    throw new Error('Invalid password');
  }

  const { merchantId, rootPayerId } = await registerMerchant({
    email: parsed.email,
    merchantName: parsed.merchantName,
    phone: parsed.phone,
  });

  const sessionToken = generateSessionToken();
  await setSession(sessionToken, {
    merchantEmail: parsed.email,
    merchantId,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  });

  return { success: true, merchantId, rootPayerId };
}

/** Sign out: clears the session cookie and deletes the Redis session. */
export async function signOut(): Promise<{ success: true }> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    await deleteSession(sessionToken);
  }
  cookieStore.set(SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
  });
  return { success: true };
}
