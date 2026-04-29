/**
 * Vertical-facing copy for the template.
 *
 * Reskinning rules:
 *   - Domain types and APIs (Payer, Payee, PaymentRail, etc.) MUST NOT change at file paths.
 *   - All user-visible labels for the active vertical live here.
 *   - Replace the values below to reskin from "restaurant tipping" to any other
 *     payouts vertical (marketplace settlements, payroll, freelance, refunds).
 *
 * v0 / LLM contract: when asked to "reskin the vertical" or "rename the product",
 * edit ONLY this file. Do NOT rename Payer/Payee/Payout types in code, do NOT touch
 * Redis key prefixes, do NOT touch route handlers.
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: "Roosterwise",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Tips paid the moment the shift ends.",
  /** Payer entity (the operator who logs in and funds payouts). */
  payerSingular: "Restaurant",
  payerPlural: "Restaurants",
  /** Used in possessive contexts: e.g. "your restaurant's bank account". */
  payerPossessive: "restaurant's",
  /** Payee entity (the person being paid). */
  payeeSingular: "Worker",
  payeePlural: "Workers",
  /** Payout terminology. */
  payoutVerb: "Tip out",
  payoutNoun: "Tip payout",
  payoutNounPlural: "Tip payouts",
  /** Funding source label on the payer settings screen. */
  funderLabel: "Restaurant bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Let's settle the night.",
  consoleSubheading:
    "Manage your house, your team, and tonight's tip-out from a single console.",
} as const;

export type Branding = typeof branding;
