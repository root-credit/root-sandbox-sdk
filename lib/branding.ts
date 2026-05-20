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
  productName: "Venmo",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Send and receive money with friends and family.",
  /** Payer entity (the user who logs in, funds the wallet, and sends money). */
  payerSingular: "Account",
  payerPlural: "Accounts",
  /** Used in possessive contexts: e.g. "your account's bank". */
  payerPossessive: "account's",
  /** Payee entity (the destination where the user moves funds out of their wallet). */
  payeeSingular: "Payout method",
  payeePlural: "Payout methods",
  /** Payout terminology — moving funds OUT of the Venmo wallet. */
  payoutVerb: "Cash out",
  payoutNoun: "Cash-out",
  payoutNounPlural: "Cash-outs",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "Linked bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Your wallet is ready.",
  consoleSubheading:
    "Send money to friends, receive payments, and cash out to your bank or debit card.",
} as const;

export type Branding = typeof branding;
