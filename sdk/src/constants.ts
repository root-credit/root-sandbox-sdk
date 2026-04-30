import type { PayoutRail } from './types.js'

/** Default base URL. Sandbox and live share this host; the API key decides the mode. */
export const DEFAULT_BASE_URL = 'https://api.useroot.com'

/** Minimum `limit` for `GET /api/payers` and `GET /api/payees` when using email filter (Root validates `>= 10`). */
export const ROOT_LIST_BY_EMAIL_MIN_LIMIT = 10

/**
 * The single magic name that forces a sandbox transfer to fail.
 * Use `payeeNameForTransaction(name, simulateFailure)` to swap it in.
 */
export const FAILURE_SIMULATION_NAME = 'John Failed'

/** Allowed test US bank account numbers. Random numbers are rejected by sandbox. */
export const ALLOWED_TEST_ACCOUNT_NUMBERS = [
  '1234567890',
  '9999999999',
  '0000123456',
  '1111222233',
] as const

/** Allowed test ABA routing numbers. Random numbers are rejected by sandbox. */
export const ALLOWED_TEST_ROUTING_NUMBERS = [
  '111000025',
  '021000021',
  '011401533',
  '091000022',
] as const

/** Allowed test card numbers (Visa, Mastercard, Amex, Discover). */
export const ALLOWED_TEST_CARD_NUMBERS = [
  '4111111111111111',
  '5555555555554444',
  '378282246310005',
  '6011111111111117',
] as const

/** YYMM expiry; '6608' = August 2066. */
export const TEST_CARD_EXPIRY = '6608'

/**
 * A safe default test bank pair. Use these in `attachPayToBank` /
 * `attachPayByBank` if the caller has no preference.
 */
export const DEFAULT_TEST_BANK = {
  account_number: ALLOWED_TEST_ACCOUNT_NUMBERS[0],
  routing_number: ALLOWED_TEST_ROUTING_NUMBERS[1],
  routing_number_type: 'aba' as const,
}

/** Default test card. Use these in `attachPushToCard` if the caller has no preference. */
export const DEFAULT_TEST_CARD = {
  card_number: ALLOWED_TEST_CARD_NUMBERS[0],
  card_expiry_date: TEST_CARD_EXPIRY,
}

/**
 * Per-rail polling defaults derived from the Root sandbox simulation timings.
 * `intervalMs` is the wait between `GET /api/payouts/{id}` (or payin) calls;
 * `timeoutMs` is the absolute cap for waiting for a terminal status.
 */
export const RAIL_POLLING: Record<
  PayoutRail,
  { intervalMs: number; timeoutMs: number }
> = {
  instant_bank: { intervalMs: 1500, timeoutMs: 20_000 },
  instant_card: { intervalMs: 1500, timeoutMs: 20_000 },
  same_day_ach: { intervalMs: 3000, timeoutMs: 90_000 },
  standard_ach: { intervalMs: 3000, timeoutMs: 90_000 },
  wire: { intervalMs: 5000, timeoutMs: 180_000 },
}

/** Generic fallback when rail is unknown. */
export const DEFAULT_POLLING = { intervalMs: 2000, timeoutMs: 60_000 }

/**
 * Helper to swap in the failure-simulation name for a single transfer
 * without changing the caller's display name elsewhere.
 */
export function payeeNameForTransaction(
  displayName: string,
  simulateFailure: boolean,
): string {
  return simulateFailure ? FAILURE_SIMULATION_NAME : displayName
}
