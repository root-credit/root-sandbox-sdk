/**
 * Vertical-facing copy for the template.
 *
 * Reskinning rules:
 *   - Domain types and APIs (Payer, Payee, PaymentRail, etc.) MUST NOT change at file paths.
 *   - All user-visible labels for the active vertical live here.
 *   - Replace the values below to reskin from "GoDaddy domain trading" to any other
 *     payouts vertical (marketplace settlements, payroll, freelance, refunds).
 *
 * v0 / LLM contract: when asked to "reskin the vertical" or "rename the product",
 * edit ONLY this file. Do NOT rename Payer/Payee/Payout types in code, do NOT touch
 * Redis key prefixes, do NOT touch route handlers.
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: "Wise",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Send money abroad. Fast, cheap, transparent.",
  /** Payer entity (the user who logs in, funds the wallet, and initiates transfers). */
  payerSingular: "Account",
  payerPlural: "Accounts",
  /** Used in possessive contexts: e.g. "your account's bank". */
  payerPossessive: "account's",
  /** Payee entity (the recipient of an international transfer). */
  payeeSingular: "Recipient",
  payeePlural: "Recipients",
  /** Payout terminology — sending money internationally. */
  payoutVerb: "Send",
  payoutNoun: "Transfer",
  payoutNounPlural: "Transfers",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "Linked bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Your money, ready to move.",
  consoleSubheading:
    "Check your Wise Account Balance, send money abroad, and track all your transfers from one place.",
  /** Wallet name for the subaccount balance. */
  walletName: "Wise Account Balance",
} as const;

export type Branding = typeof branding;
