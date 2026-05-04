import {
  Root,
  DEFAULT_BASE_URL,
  RootApiError,
  type CreatePayinBody,
  Subaccount,
} from "@root-credit/root-sdk";

if (!process.env.ROOT_API_KEY) {
  throw new Error("Missing ROOT_API_KEY environment variable");
}

/**
 * Lazily construct the Root client so importing this module during Next.js build
 * does not require ROOT_API_KEY until a Root API call runs.
 */
let rootClient: Root | undefined;
/** Same default host as the SDK; override with ROOT_BASE_URL for sandbox vs live. */
const ROOT_API_BASE = process.env.ROOT_BASE_URL ?? DEFAULT_BASE_URL;

// export const rootAPI = new Root({
//   apiKey: process.env.ROOT_API_KEY,
//   baseUrl: ROOT_API_BASE,
// });
function getRootAPI(): Root {
  if (!rootClient) {
    const apiKey = process.env.ROOT_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("Missing ROOT_API_KEY environment variable");
    }
    rootClient = new Root({
      apiKey,
      baseUrl: process.env.ROOT_BASE_URL ?? DEFAULT_BASE_URL,
    });
  }
  return rootClient;
}

/** @deprecated Prefer {@link getRootAPI} — exported for rare escape hatches. */
export const rootAPI = new Proxy({} as Root, {
  get(_target, prop: keyof Root | symbol, receiver) {
    const client = getRootAPI();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export type SubaccountLedgerSnapshot = {
  id: string;
  name: string;
  totalIncomingCents: number;
  totalOutgoingCents: number;
  balanceCents: number;
};

function coerceCents(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Math.trunc(Number(v));
  }
  return 0;
}

/**
 * GET /api/subaccounts/{id} — wallet ledger totals (incoming/outgoing lifetime).
 */
export async function getSubaccountLedgerSnapshot(
  subaccountId: string,
): Promise<SubaccountLedgerSnapshot> {
  const sub = await getRootAPI().subaccounts.get(subaccountId);
  const row = sub as Subaccount & Record<string, unknown>;
  const incoming = coerceCents(
    row.total_incoming_cents ?? row.totalIncomingCents,
  );
  const outgoing = coerceCents(
    row.total_outgoing_cents ?? row.totalOutgoingCents,
  );
  return {
    id: sub.id,
    name: sub.name,
    totalIncomingCents: incoming,
    totalOutgoingCents: outgoing,
    balanceCents: incoming - outgoing,
  };
}

export type PayoutRail =
  | "instant_bank"
  | "instant_card"
  | "same_day_ach"
  | "standard_ach"
  | "wire";

/**
 * Root payouts API rails depend on how the payee receives funds (bank RTP vs push-to-card).
 */
export function payoutRailForPayee(payee: {
  paymentMethodType?: string;
}): PayoutRail {
  return payee.paymentMethodType === "debit_card"
    ? "instant_card"
    : "instant_bank";
}

/**
 * Root may signal "already exists" as 409 or as other statuses with a duplicate-ish payload.
 */
function isDuplicatePayerConflict(error: unknown): boolean {
  if (error instanceof RootApiError) {
    if (error.status === 409) return true;
    const blob = `${error.rawText}\n${JSON.stringify(error.body ?? '')}`.toLowerCase();
    if (
      /duplicate|already exists|already registered|unique|resource exists/i.test(blob)
    ) {
      return true;
    }
    return false;
  }
  if (error instanceof Error) {
    return /\b409\b/.test(error.message) && /already exists|duplicate/i.test(error.message);
  }
  return false;
}

/**
 * Resolve an existing Root payer by email via the SDK (`payers.findByEmail`).
 */
async function findRootPayerByEmail(email: string) {
  return rootAPI.payers.findByEmail(email.trim());
}

/**
 * Create a payer in Root, or return the existing Root payer for this email.
 *
 * Order of operations:
 * 1. **Lookup first** — if Root already has this email (e.g. app Redis was wiped), use that payer
 *    and skip create (no dependency on create returning 409).
 * 2. **Create** — happy path for brand-new emails.
 * 3. **Duplicate handling** — if create fails with a duplicate-like error, resolve again by email
 *    (race or non-409 error shapes).
 */
export async function getOrCreateRootPayer(payerData: {
  email: string;
  name: string;
  phone?: string;
}) {
  const email = payerData.email.trim();

  const existingFirst = await findRootPayerByEmail(email);
  if (existingFirst) {
    console.log(
      '[v0] Root payer already exists for this email; linking (e.g. Redis empty but Root has payer):',
      existingFirst.id,
    );
    return existingFirst;
  }

  try {
    const response = await rootAPI.payers.create({
      email,
      name: payerData.name,
      metadata: {
        type: 'payer',
        onboardingDate: new Date().toISOString(),
      },
    });
    console.log('[v0] Created Root payer:', response.id);
    return response;
  } catch (error) {
    if (!isDuplicatePayerConflict(error)) {
      console.error('[v0] Error creating Root payer:', error);
      throw error;
    }
    console.warn(
      '[v0] Create failed with duplicate-like error; resolving Root payer by email.',
    );
    const existingAfterConflict = await findRootPayerByEmail(email);
    if (existingAfterConflict) {
      console.log('[v0] Linked existing Root payer:', existingAfterConflict.id);
      return existingAfterConflict;
    }
    throw new Error(
      'Root indicates this payer email already exists but could not load the payer by email. Try again or contact support.',
    );
  }
}

async function findRootPayeeByEmail(email: string) {
  return rootAPI.payees.findByEmail(email.trim());
}

/**
 * Create a Root payee or return the existing one for this email (409 / duplicate-safe).
 * Mirrors {@link getOrCreateRootPayer}: remote API is authoritative; Redis must not run ahead of it.
 */
export async function getOrCreateRootPayee(payeeData: {
  email: string;
  name: string;
  phone?: string;
}) {
  const email = payeeData.email.trim();

  const existingFirst = await findRootPayeeByEmail(email);
  if (existingFirst) {
    console.log(
      "[v0] Root payee already exists for this email; reusing:",
      existingFirst.id,
    );
    return existingFirst;
  }

  try {
    const response = await rootAPI.payees.create({
      email,
      name: payeeData.name,
      metadata: {
        type: "payee",
        onboardingDate: new Date().toISOString(),
      },
    });
    console.log("[v0] Created Root payee:", response.id);
    return response;
  } catch (error) {
    if (!isDuplicatePayerConflict(error)) {
      console.error("[v0] Error creating Root payee:", error);
      throw error;
    }
    console.warn(
      "[v0] Create payee failed with duplicate-like error; resolving Root payee by email.",
    );
    const existingAfterConflict = await findRootPayeeByEmail(email);
    if (existingAfterConflict) {
      console.log("[v0] Linked existing Root payee:", existingAfterConflict.id);
      return existingAfterConflict;
    }
    throw new Error(
      "Root indicates this payee email already exists but could not load the payee by email. Try again or contact support.",
    );
  }
}

/**
 * Attach a bank account to a payer for funding (ACH debit pull).
 * Optionally associates the payment method with a Root subaccount (`subaccount_id` query).
 */
export async function attachPayerBankAccount(
  payerId: string,
  bankData: {
    accountNumber: string;
    routingNumber: string;
  },
  opts?: { subaccountId?: string; isDefault?: boolean }
) {
  try {
    const query = {
      is_default: opts?.isDefault ?? true,
      ...(opts?.subaccountId ? { subaccount_id: opts.subaccountId } : {}),
    };
    const response = await rootAPI.payers.attachPayByBank(
      payerId,
      {
        account_number: bankData.accountNumber,
        routing_number: bankData.routingNumber,
      },
      query
    );
    console.log("[v0] Attached bank account to payer:", payerId);
    return response;
  } catch (error) {
    console.error("[v0] Error attaching bank account:", error);
    throw error;
  }
}

/** Create a Root subaccount (`POST /api/subaccounts/`). */
export async function createRootSubaccount(name: string) {
  try {
    const response = await rootAPI.subaccounts.create({ name });
    console.log("[v0] Created subaccount:", response.id);
    return response;
  } catch (error) {
    console.error("[v0] Error creating subaccount:", error);
    throw error;
  }
}

/** Move funds between subaccounts (`POST /api/subaccounts/move`). */
export async function moveRootSubaccountFunds(args: {
  from_subaccount_id: string;
  to_subaccount_id: string;
  amount_in_cents: number;
}) {
  try {
    const response = await rootAPI.subaccounts.move(args);
    console.log("[v0] Moved funds between subaccounts:", response.id);
    return response;
  } catch (error) {
    console.error("[v0] Error moving subaccount funds:", error);
    throw error;
  }
}

/** Create a payin (ACH pull into `subaccount_id`). Merges `defaultSubaccountId` when body omits `subaccount_id`. */
export async function createRootPayin(
  body: CreatePayinBody,
  opts?: { defaultSubaccountId?: string },
) {
  try {
    const merged: CreatePayinBody = {
      ...body,
      subaccount_id: body.subaccount_id ?? opts?.defaultSubaccountId,
    };
    const response = await rootAPI.payins.create(merged);
    console.log("[v0] Created payin:", response.id);
    return response;
  } catch (error) {
    console.error("[v0] Error creating payin:", error);
    throw error;
  }
}

/**
 * Attach a bank account to a payee for receiving funds.
 */
export async function attachPayeeBankAccount(
  payeeId: string,
  bankData: {
    accountNumber: string;
    routingNumber: string;
  }
) {
  try {
    const response = await rootAPI.payees.attachPayToBank(payeeId, {
      account_number: bankData.accountNumber,
      routing_number: bankData.routingNumber,
    });
    console.log("[v0] Attached bank account to payee:", payeeId);
    return response;
  } catch (error) {
    console.error("[v0] Error attaching bank account to payee:", error);
    throw error;
  }
}

/**
 * Attach a debit card to a payee for receiving funds (instant push-to-card).
 */
export async function attachPayeeDebitCard(
  payeeId: string,
  cardData: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
  }
) {
  try {
    // Updated to YYMM format: e.g., "3009"
    const expiryDate = `${String(cardData.expiryYear).slice(-2)}${String(cardData.expiryMonth).padStart(2, '0')}`;
    const response = await rootAPI.payees.attachPushToCard(payeeId, {
      card_number: cardData.cardNumber,
      card_expiry_date: expiryDate,
    });
    console.log("[v0] Attached debit card to payee:", payeeId);
    return response;
  } catch (error) {
    console.error("[v0] Error attaching debit card:", error);
    throw error;
  }
}

/**
 * Create a payout to a payee. Rail must be compatible with the payee's payment method
 * (use {@link payoutRailForPayee} to derive it from a stored Payee record).
 */
export async function createPayout(
  payeeId: string,
  amountCents: number,
  rail: PayoutRail = "instant_bank",
  opts?: { subaccountId?: string },
) {
  try {
    const response = await rootAPI.payouts.create({
      payee_id: payeeId,
      amount_in_cents: amountCents,
      rail,
      ...(opts?.subaccountId ? { subaccount_id: opts.subaccountId } : {}),
      auto_approve: true,
      metadata: {
        type: "payout",
        processedAt: new Date().toISOString(),
      },
    });
    console.log("[v0] Created payout:", response.id);
    return response;
  } catch (error) {
    console.error("[v0] Error creating payout:", error);
    throw error;
  }
}

/**
 * Get current payout status from Root.
 */
export async function getPayoutStatus(payoutId: string) {
  try {
    const response = await rootAPI.payouts.get(payoutId);
    return response;
  } catch (error) {
    console.error("[v0] Error fetching payout:", error);
    throw error;
  }
}
