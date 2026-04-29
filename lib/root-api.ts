import {
  Root,
  DEFAULT_BASE_URL,
  RootApiError,
  type CreatePayinBody,
} from "@root-credit/root-sdk";

if (!process.env.ROOT_API_KEY) {
  throw new Error("Missing ROOT_API_KEY environment variable");
}

/** Same default host as the SDK; override with ROOT_BASE_URL for sandbox vs live. */
const ROOT_API_BASE = process.env.ROOT_BASE_URL ?? DEFAULT_BASE_URL;

export const rootAPI = new Root({
  apiKey: process.env.ROOT_API_KEY,
  baseUrl: ROOT_API_BASE,
});

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

function isDuplicatePayerConflict(error: unknown): boolean {
  if (error instanceof RootApiError && error.status === 409) {
    return true;
  }
  if (error instanceof Error) {
    return /\b409\b/.test(error.message) && /already exists|duplicate/i.test(error.message);
  }
  return false;
}

/**
 * Create a payer in Root, or if one already exists for this email (e.g. Redis was cleared),
 * resolve and return the existing payer via list/findByEmail.
 */
export async function getOrCreateRootPayer(payerData: {
  email: string;
  name: string;
  phone?: string;
}) {
  try {
    const response = await rootAPI.payers.create({
      email: payerData.email,
      name: payerData.name,
      metadata: {
        type: "payer",
        onboardingDate: new Date().toISOString(),
      },
    });
    console.log("[v0] Created Root payer:", response.id);
    return response;
  } catch (error) {
    if (!isDuplicatePayerConflict(error)) {
      console.error("[v0] Error creating Root payer:", error);
      throw error;
    }
    console.warn(
      "[v0] Root payer already exists for this email; reusing existing payer (typical after Redis clear)."
    );
    const existing = await rootAPI.payers.findByEmail(payerData.email);
    if (existing) {
      console.log("[v0] Linked existing Root payer:", existing.id);
      return existing;
    }
    throw new Error(
      "Root reports this payer email already exists but could not load the payer by email. Try again or contact support."
    );
  }
}

/**
 * Create a payee in Root.
 */
export async function createRootPayee(payeeData: {
  email: string;
  name: string;
  phone?: string;
}) {
  try {
    const response = await rootAPI.payees.create({
      email: payeeData.email,
      name: payeeData.name,
      metadata: {
        type: "payee",
        onboardingDate: new Date().toISOString(),
      },
    });
    console.log("[v0] Created Root payee:", response.id);
    return response;
  } catch (error) {
    console.error("[v0] Error creating Root payee:", error);
    throw error;
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

/** Create a payin (ACH pull into `subaccount_id`). Caller supplies full SDK body. */
export async function createRootPayin(body: CreatePayinBody) {
  try {
    const response = await rootAPI.payins.create(body);
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
  rail: PayoutRail = "instant_bank"
) {
  try {
    const response = await rootAPI.payouts.create({
      payee_id: payeeId,
      amount_in_cents: amountCents,
      rail,
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
