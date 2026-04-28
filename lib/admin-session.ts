import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { redis } from "./redis";

function parseAdminSessionPayload(raw: unknown): { email: string } | null {
  if (raw == null) return null;
  if (typeof raw === "object" && raw !== null && "email" in raw) {
    return { email: String((raw as { email: string }).email) };
  }
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw) as { email: string };
      return o?.email ? { email: o.email } : null;
    } catch {
      return null;
    }
  }
  return null;
}

export const ADMIN_EMAIL_DEFAULT = "admin@root.credit";
export const ADMIN_PASSWORD_DEFAULT = "1234567890";

export function getConfiguredAdminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() || ADMIN_EMAIL_DEFAULT;
}

export function getConfiguredAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? ADMIN_PASSWORD_DEFAULT;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const e = email.trim().toLowerCase();
  return (
    e === getConfiguredAdminEmail().toLowerCase() &&
    password === getConfiguredAdminPassword()
  );
}

const ADMIN_SESSION_PREFIX = "admin_session:";
export const ADMIN_SESSION_TTL_SEC = 60 * 60 * 8; // 8 hours

export async function createAdminSessionToken(): Promise<string> {
  const token = randomUUID();
  await redis.setex(
    `${ADMIN_SESSION_PREFIX}${token}`,
    ADMIN_SESSION_TTL_SEC,
    JSON.stringify({ email: getConfiguredAdminEmail() })
  );
  return token;
}

export async function getAdminSessionByToken(
  token: string | undefined
): Promise<{ email: string } | null> {
  if (!token?.trim()) return null;
  const raw = await redis.get(`${ADMIN_SESSION_PREFIX}${token.trim()}`);
  return parseAdminSessionPayload(raw);
}

export async function deleteAdminSessionToken(token: string): Promise<void> {
  await redis.del(`${ADMIN_SESSION_PREFIX}${token.trim()}`);
}

export async function getAdminSessionFromCookies(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  return getAdminSessionByToken(token);
}
