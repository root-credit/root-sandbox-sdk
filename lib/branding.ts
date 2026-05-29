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
  productName: "Gusto",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Run payroll in minutes, not hours.",
  /** Payer entity (the employer who logs in, funds the wallet, and pays employees). */
  payerSingular: "Employer",
  payerPlural: "Employers",
  /** Used in possessive contexts: e.g. "your employer's bank". */
  payerPossessive: "employer's",
  /** Payee entity (employees who receive payroll). */
  payeeSingular: "Employee",
  payeePlural: "Employees",
  /** Payout terminology — moving funds OUT of the Gusto Payroll Wallet. */
  payoutVerb: "Pay out",
  payoutNoun: "Payout",
  payoutNounPlural: "Payouts",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "Linked bank account",
  funderShortLabel: "Bank account",
  /** Wallet name */
  walletName: "Gusto Payroll Wallet",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Your payroll dashboard awaits.",
  consoleSubheading:
    "Manage your Gusto Payroll Wallet, add employees, and run payroll from one dashboard.",
} as const;

export type Branding = typeof branding;
