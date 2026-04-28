/**
 * Vertical-facing copy for the template.
 *
 * Reskinning rules:
 *   - Domain types and APIs (Merchant, Payee, PaymentRail, etc.) MUST NOT change.
 *   - All user-visible labels for the active vertical live here.
 *   - Replace the values below to reskin from "restaurant tipping" to any other
 *     payouts vertical (marketplace settlements, payroll, freelance, refunds).
 *
 * v0 / LLM contract: when asked to "reskin the vertical" or "rename the product",
 * edit ONLY this file. Do NOT rename Merchant/Payee/Payout in code, do NOT touch
 * Redis keys, do NOT touch route handlers.
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: "DashPay Console",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Dasher earnings paid in seconds after delivery.",
  /** Merchant entity (the operator who logs in and funds payouts). */
  merchantSingular: "Platform",
  merchantPlural: "Platforms",
  /** Used in possessive contexts: e.g. "your platform's bank account". */
  merchantPossessive: "platform's",
  /** Payee entity (the person being paid). */
  payeeSingular: "Dasher",
  payeePlural: "Dashers",
  /** Payout terminology. */
  payoutVerb: "Pay out",
  payoutNoun: "Delivery payout",
  payoutNounPlural: "Delivery payouts",
  /** Funding source label on the merchant settings screen. */
  funderLabel: "Platform funding account",
  funderShortLabel: "Funding account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome to DashPay. Settle earnings fast.",
  consoleSubheading:
    "Manage your platforms, your dashers, and tonight's payouts from a single console.",
} as const;

export type Branding = typeof branding;
