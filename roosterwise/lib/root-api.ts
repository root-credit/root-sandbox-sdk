import { Root } from "@root-credit/root-sdk";

if (!process.env.ROOT_API_KEY) {
  throw new Error("Missing ROOT_API_KEY environment variable");
}

const ROOT_API_BASE = process.env.ROOT_BASE_URL || "https://sandbox.root.com";

export const rootAPI = new Root({
  apiKey: process.env.ROOT_API_KEY,
  baseUrl: ROOT_API_BASE,
});

/**
 * Create a payer (restaurant) in Root
 */
export async function createRootPayer(restaurantData: {
  email: string;
  name: string;
  phone?: string;
}) {
  try {
    const response = await rootAPI.payers.create({
      email: restaurantData.email,
      name: restaurantData.name,
      metadata: {
        type: "restaurant",
        onboardingDate: new Date().toISOString(),
      },
    });
    console.log("[v0] Created Root payer (restaurant):", response.id);
    return response;
  } catch (error) {
    console.error("[v0] Error creating Root payer:", error);
    throw error;
  }
}

/**
 * Create a payee (worker) in Root
 */
export async function createRootPayee(workerData: {
  email: string;
  name: string;
  phone?: string;
}) {
  try {
    const response = await rootAPI.payees.create({
      email: workerData.email,
      name: workerData.name,
      metadata: {
        type: "worker",
        onboardingDate: new Date().toISOString(),
      },
    });
    console.log("[v0] Created Root payee (worker):", response.id);
    return response;
  } catch (error) {
    console.error("[v0] Error creating Root payee:", error);
    throw error;
  }
}

/**
 * Attach a bank account to a payer for funding
 */
export async function attachPayerBankAccount(
  payerId: string,
  bankData: {
    accountNumber: string;
    routingNumber: string;
  }
) {
  try {
    const response = await rootAPI.payers.attachPayByBank(payerId, {
      account_number: bankData.accountNumber,
      routing_number: bankData.routingNumber,
    });
    console.log("[v0] Attached bank account to payer:", payerId);
    return response;
  } catch (error) {
    console.error("[v0] Error attaching bank account:", error);
    throw error;
  }
}

/**
 * Attach a bank account to a payee for receiving funds
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
 * Attach a debit card to a payee for receiving funds
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
    const expiryDate = `${String(cardData.expiryMonth).padStart(2, '0')}/${String(cardData.expiryYear).slice(-2)}`;
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
 * Create a payout from a payee (worker)
 */
export async function createTipPayout(
  payeeId: string,
  amountCents: number,
  rail: PayoutRail = "instant_card"
) {
  try {
    const response = await rootAPI.payouts.create({
      payee_id: payeeId,
      amount_in_cents: amountCents,
      rail,
      auto_approve: true,
      metadata: {
        type: "tip_payout",
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
 * Get payout status
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

type PayoutRail = 'instant_bank' | 'instant_card' | 'same_day_ach' | 'standard_ach' | 'wire';
