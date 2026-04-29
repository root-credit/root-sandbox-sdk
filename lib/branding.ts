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
  productName: "Workforce Connect",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Connecting the front office to the front line.",
  /** Payer entity (the operator who logs in and funds payouts). */
  payerSingular: "Organization",
  payerPlural: "Enterprises",
  /** Used in possessive contexts: e.g. "your organization's bank account". */
  payerPossessive: "organization's",
  /** Payee entity (the person being paid). */
  payeeSingular: "Employee",
  payeePlural: "Workforce",
  /** Payout terminology. */
  payoutVerb: "Disburse",
  payoutNoun: "Earnings Disbursement",
  payoutNounPlural: "Payroll Cycles",
  /** Funding source label on the payer settings screen. */
  funderLabel: "Corporate Funding Account",
  funderShortLabel: "Funding Account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Empowering every employee, in any moment.",
  consoleSubheading:
    "Unifying payroll, insights, and frontline empowerment into one command center.",
} as const;

export type Branding = typeof branding;
