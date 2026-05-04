/**
 * Vertical-facing copy for the template.
 *
 * Reskinning rules:
 *   - Domain types and APIs (Payer, Payee, PaymentRail, etc.) MUST NOT change at file paths.
 *   - All user-visible labels for the active vertical live here.
 *   - Replace the values below to reskin from the active vertical to any other
 *     payouts vertical (marketplace settlements, payroll, freelance, refunds).
 *
 * v0 / LLM contract: when asked to "reskin the vertical" or "rename the product",
 * edit ONLY this file. Do NOT rename Payer/Payee/Payout types in code, do NOT touch
 * Redis key prefixes, do NOT touch route handlers.
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: "Instawork",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Staff your shifts. Pay your crew. Same day.",
  /** Payer entity (the employer admin who funds the wallet and books shift workers). */
  payerSingular: "Workplace",
  payerPlural: "Workplaces",
  /** Used in possessive contexts: e.g. "your workplace's bank". */
  payerPossessive: "workplace's",
  /** Payee entity (the destination where the workplace sends payouts after shifts). */
  payeeSingular: "Shift worker",
  payeePlural: "Shift workers",
  /** Payout terminology — moving funds OUT of the Instawork wallet to a worker. */
  payoutVerb: "Pay out",
  payoutNoun: "Payout",
  payoutNounPlural: "Payouts",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "Linked bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Let's get your shifts staffed.",
  consoleSubheading:
    "Fund your Instawork wallet, post open shifts to the marketplace, and pay your crew the moment a shift wraps.",
} as const;

export type Branding = typeof branding;
