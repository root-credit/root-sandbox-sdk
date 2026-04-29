import { randomUUID } from "crypto";
import CryptoJS from "crypto-js";
import { getPayerByEmail, setPayer } from "./redis";
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

  await setPayer(payerId, {
    id: payerId,
    payerEmail: input.email,
    payerName: input.payerName,
    phone: input.phone,
    rootPayerId: rootPayer.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    payerId,
    rootPayerId: rootPayer.id,
  };
}
