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
  productName: "UKG Salary Disbursement",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Salaries disbursed efficiently, directly to employee bank accounts.",
  /** Payer entity (the operator who logs in and funds payouts). */
  payerSingular: "Employer",
  payerPlural: "Employers",
  /** Used in possessive contexts: e.g. "your employer's bank account". */
  payerPossessive: "employer's",
  /** Payee entity (the person being paid). */
  payeeSingular: "Employee",
  payeePlural: "Employees",
  /** Payout terminology. */
  payoutVerb: "Disburse salary",
  payoutNoun: "Salary disbursement",
  payoutNounPlural: "Salary disbursements",
  /** Funding source label on the payer settings screen. */
  funderLabel: "Employer bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Manage your salary disbursements.",
  consoleSubheading:
    "Oversee your employees, disbursement schedules, and transaction history from a single dashboard.",
} as const;

export type Branding = typeof branding;
