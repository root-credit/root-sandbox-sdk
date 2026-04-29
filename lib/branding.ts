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
  tagline: "The enterprise financial stack for modern hospitality.",
  /** Payer entity (the operator who logs in and funds payouts). */
  payerSingular: "Venue Operator",
  payerPlural: "Restaurant Groups",
  /** Used in possessive contexts: e.g. "your venue operator's bank account". */
  payerPossessive: "venue's",
  /** Payee entity (the person being paid). */
  payeeSingular: "Staff Member",
  payeePlural: "Service Staff",
  /** Payout terminology. */
  payoutVerb: "Settle",
  payoutNoun: "Tip Settlement",
  payoutNounPlural: "Tip Settlements",
  /** Funding source label on the payer settings screen. */
  funderLabel: "Operating Account (House Fund)",
  funderShortLabel: "House Fund",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Hospitality Financial Control",
  consoleSubheading:
    "Manage payouts across all locations and staff from a single pane of glass.",
} as const;

export type Branding = typeof branding;
