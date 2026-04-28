import { redis } from "./redis";
import { hashPassword, verifyPassword } from "./password-hash";

/** Used when no hash exists in Redis yet (demo default). */
export const DEFAULT_APP_LOGIN_PASSWORD = "1234567890";

const APP_LOGIN_PASSWORD_HASH_KEY = "app:settings:login_password_hash";

export async function getStoredLoginPasswordHash(): Promise<string | null> {
  const v = await redis.get(APP_LOGIN_PASSWORD_HASH_KEY);
  if (v == null) return null;
  return typeof v === "string" ? v : null;
}

export async function setStoredLoginPassword(plain: string): Promise<void> {
  await redis.set(APP_LOGIN_PASSWORD_HASH_KEY, hashPassword(plain));
}

/**
 * Login/signup must satisfy this password for all restaurant accounts (sandbox demo).
 * If Redis has no hash, only DEFAULT_APP_LOGIN_PASSWORD is accepted until admin sets one.
 */
export async function verifySharedAppPassword(password: string): Promise<boolean> {
  const stored = await getStoredLoginPasswordHash();
  if (!stored) {
    return password === DEFAULT_APP_LOGIN_PASSWORD;
  }
  return verifyPassword(password, stored);
}
