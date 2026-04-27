import { Root } from "@root-credit/root-sdk";

if (!process.env.ROOT_API_KEY) {
  throw new Error("Missing ROOT_API_KEY environment variable");
}

const ROOT_API_BASE = process.env.ROOT_API_BASE_URL || "https://api.useroot.com";

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
    accountHolderName: string;
  }
) {
  try {
    const response = await rootAPI.payers.attachPayToBank(payerId, {
      accountNumber: bankData.accountNumber,
      routingNumber: bankData.routingNumber,
      accountHolderName: bankData.accountHolderName,
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
    accountHolderName: string;
  }
) {
  try {
    const response = await rootAPI.payees.attachPayByBank(payeeId, {
      accountNumber: bankData.accountNumber,
      routingNumber: bankData.routingNumber,
      accountHolderName: bankData.accountHolderName,
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
    cvv: string;
    cardholderName: string;
  }
) {
  try {
    const response = await rootAPI.payees.attachPushToCard(payeeId, {
      cardNumber: cardData.cardNumber,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: cardData.cvv,
      cardholderName: cardData.cardholderName,
    });
    console.log("[v0] Attached debit card to payee:", payeeId);
    return response;
  } catch (error) {
    console.error("[v0] Error attaching debit card:", error);
    throw error;
  }
}

/**
 * Create a payout from a payer to a payee
 */
export async function createTipPayout(
  payerId: string,
  payeeId: string,
  amountCents: number,
  rail: "rtp" | "ach" = "rtp"
) {
  try {
    const response = await rootAPI.payouts.create({
      amount: amountCents,
      payerId,
      payeeId,
      rail,
      description: "Tip payout from Roosterwise",
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
