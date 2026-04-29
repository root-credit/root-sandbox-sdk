import { redis } from "./redis";
import { hashPassword, verifyPassword } from "./password-hash";

/** Used when no hash exists in Redis yet (demo default). */
export const DEFAULT_APP_LOGIN_PASSWORD = "1234567890";

const APP_LOGIN_PASSWORD_HASH_KEY = "app:settings:login_password_hash";

export async function getStoredLoginPasswordHash(): Promise<string | null> {
  try {
    const v = await redis.get(APP_LOGIN_PASSWORD_HASH_KEY);
    if (v == null) return null;
    return typeof v === "string" ? v : null;
  } catch (err) {
    // Older deploys may have stored this key as a different Redis type, which
    // makes `GET` throw `WRONGTYPE`. Self-heal by deleting the stale key and
    // treating it as "no password set" so the default demo password works.
    if (err instanceof Error && /WRONGTYPE/i.test(err.message)) {
      try {
        await redis.del(APP_LOGIN_PASSWORD_HASH_KEY);
      } catch {
        /* ignore */
      }
      return null;
    }
    throw err;
  }
}

export async function setStoredLoginPassword(plain: string): Promise<void> {
  // `del` first to avoid WRONGTYPE if the key was previously stored as a
  // hash/list/set on a shared Upstash instance.
  try {
    await redis.del(APP_LOGIN_PASSWORD_HASH_KEY);
  } catch {
    /* ignore */
  }
  await redis.set(APP_LOGIN_PASSWORD_HASH_KEY, hashPassword(plain));
}

/**
 * Login/signup must satisfy this shared password (sandbox demo for all payer accounts).
 * If Redis has no hash, only DEFAULT_APP_LOGIN_PASSWORD is accepted until admin sets one.
 */
export async function verifySharedAppPassword(password: string): Promise<boolean> {
  const stored = await getStoredLoginPasswordHash();
  if (!stored) {
    return password === DEFAULT_APP_LOGIN_PASSWORD;
  }
  return verifyPassword(password, stored);
}
