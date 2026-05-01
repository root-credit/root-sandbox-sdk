/**
 * Vertical-facing copy for the template.
 *
 * Reskinning rules:
 *   - Domain types and APIs (Payer, Payee, PaymentRail, etc.) MUST NOT change at file paths.
 *   - All user-visible labels for the active vertical live here.
 *   - Replace the values below to reskin to any other payouts vertical.
 *
 * v0 / LLM contract: when asked to "reskin the vertical" or "rename the product",
 * edit ONLY this file. Do NOT rename Payer/Payee/Payout types in code, do NOT touch
 * Redis key prefixes, do NOT touch route handlers.
 *
 * Active vertical: Gusto — modern payroll. The payer is the employer admin who
 * funds a Gusto wallet from their bank and pays employees on a weekly schedule.
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: "Gusto",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Modern payroll. Direct deposits. One click.",
  /** Payer entity (the employer admin who logs in, funds the wallet, runs payroll). */
  payerSingular: "Employer",
  payerPlural: "Employers",
  /** Used in possessive contexts: e.g. "your employer's bank". */
  payerPossessive: "employer's",
  /** Payee entity (the employee who gets paid weekly). */
  payeeSingular: "Employee",
  payeePlural: "Employees",
  /** Payout terminology — moving funds OUT of the Gusto wallet to employees. */
  payoutVerb: "Pay out",
  payoutNoun: "Payroll run",
  payoutNounPlural: "Payroll runs",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "Employer bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Your team is ready to be paid.",
  consoleSubheading:
    "Manage your team, fund your Gusto wallet from your bank, and run payroll in one click.",
} as const;

export type Branding = typeof branding;
