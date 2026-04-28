import { randomUUID } from "crypto";
import CryptoJS from "crypto-js";
import { getMerchantByEmail, setMerchant } from "./redis";
import { getOrCreateRootPayer } from "./root-api";

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
 * Register a new merchant (creates the Root payer or links to an existing one,
 * then writes the merchant record to Redis).
 */
export async function registerMerchant(input: {
  email: string;
  merchantName: string;
  phone: string;
}) {
  if (!validateEmail(input.email)) {
    throw new Error("Invalid email format");
  }

  const existing = await getMerchantByEmail(input.email);
  if (existing) {
    throw new Error("A merchant account with this email already exists");
  }

  // Resolve Root payer: create or reuse if sandbox already has this email (Redis cleared).
  const rootPayer = await getOrCreateRootPayer({
    email: input.email,
    name: input.merchantName,
    phone: input.phone,
  });

  const merchantId = randomUUID();

  await setMerchant(merchantId, {
    id: merchantId,
    merchantEmail: input.email,
    merchantName: input.merchantName,
    phone: input.phone,
    rootPayerId: rootPayer.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    merchantId,
    rootPayerId: rootPayer.id,
  };
}
