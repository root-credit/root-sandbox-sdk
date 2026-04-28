import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Demo admin gate — fixed credentials (not stored in Redis).
 * Cookie sessions are signed with HMAC only (stateless).
 */
export const HARDCODED_ADMIN_EMAIL = "admin@root.credit";
export const HARDCODED_ADMIN_PASSWORD = "1234567890";

/**
 * Used only to sign the HTTP-only admin cookie (no Redis).
 * Override in env if you need rotation without redeploying secrets embedded elsewhere.
 */
const ADMIN_COOKIE_SECRET =
  process.env.ADMIN_SESSION_SECRET ??
  "roosterwise-admin-hmac-v1-demo-change-if-public-repo";

export const ADMIN_SESSION_TTL_SEC = 60 * 60 * 8; // 8 hours

export function verifyAdminCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase() &&
    password === HARDCODED_ADMIN_PASSWORD
  );
}

export function createAdminSessionToken(): string {
  const expSec = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SEC;
  const payloadObj = {
    v: 1 as const,
    email: HARDCODED_ADMIN_EMAIL,
    exp: expSec,
  };
  const payload = Buffer.from(JSON.stringify(payloadObj), "utf8").toString("base64url");
  const sig = createHmac("sha256", ADMIN_COOKIE_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySignedAdminSession(
  cookieValue: string | undefined
): { email: string } | null {
  if (!cookieValue?.includes(".")) return null;
  const dot = cookieValue.lastIndexOf(".");
  const payloadB64 = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!payloadB64 || !sig) return null;

  const expectedSig = createHmac("sha256", ADMIN_COOKIE_SECRET)
    .update(payloadB64)
    .digest("base64url");

  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length) return null;
  try {
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as { email?: string; exp?: number; v?: number };
    if (typeof parsed.exp !== "number" || typeof parsed.email !== "string") {
      return null;
    }
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: parsed.email };
  } catch {
    return null;
  }
}

export async function getAdminSessionFromCookies(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("admin_session")?.value;
  return verifySignedAdminSession(raw);
}
