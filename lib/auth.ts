import { randomUUID } from "crypto";
import CryptoJS from "crypto-js";
import { getPayerByEmail, setPayer } from "./redis";
import { createRootSubaccount, getOrCreateRootPayer } from "./root-api";
import { branding } from "./branding";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-key-change-in-production";

/** Generate a session token. */
export function generateSessionToken(): string {
  return randomUUID();
}

/** Hash an email for validation (not used as a credential — just an integrity helper). */
export function hashEmail(email: string): string {
  return CryptoJS.SHA256(email + AUTH_SECRET).toString();
}

/** Validate email format. */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Register a new payer (creates the Root payer or links to an existing one,
 * then writes the payer record to Redis).
 */
export async function registerPayer(input: {
  email: string;
  payerName: string;
  phone: string;
}) {
  if (!validateEmail(input.email)) {
    throw new Error("Invalid email format");
  }

  const existing = await getPayerByEmail(input.email);
  if (existing) {
    throw new Error("A payer account with this email already exists");
  }

  const rootPayer = await getOrCreateRootPayer({
    email: input.email,
    name: input.payerName,
    phone: input.phone,
  });

  const payerId = randomUUID();

  // Auto-provision the user's Dental Dynamics wallet (Root subaccount)
  // immediately on signup. The brief requires the wallet to exist as soon as
  // the account exists; if Root is unreachable we still create the account so
  // the user can retry from /dashboard/account later.
  let subaccountId: string | undefined;
  try {
    const walletName = `${input.payerName} · ${branding.productName} wallet`.slice(
      0,
      128,
    );
    const sub = await createRootSubaccount(walletName);
    subaccountId = sub.id;
  } catch (err) {
    console.warn(
      "[v0] Failed to auto-provision wallet subaccount on signup:",
      err instanceof Error ? err.message : err,
    );
  }

  await setPayer(payerId, {
    id: payerId,
    payerEmail: input.email,
    payerName: input.payerName,
    phone: input.phone,
    rootPayerId: rootPayer.id,
    ...(subaccountId ? { subaccountId } : {}),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    payerId,
    rootPayerId: rootPayer.id,
    subaccountId,
  };
}
