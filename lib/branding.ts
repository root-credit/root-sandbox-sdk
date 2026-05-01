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
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: "Dental Dynamics",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Hire dental temp staff by the hour. Pay the moment the chair fills.",
  /** Payer entity (the user who logs in, funds the wallet, posts shifts, and hires). */
  payerSingular: "Member",
  payerPlural: "Members",
  /** Used in possessive contexts: e.g. "your member's bank". */
  payerPossessive: "member's",
  /** Payee entity (the destination where the user moves funds out of their wallet). */
  payeeSingular: "Payout method",
  payeePlural: "Payout methods",
  /** Payout terminology — moving funds OUT of the Dental Dynamics wallet. */
  payoutVerb: "Withdraw",
  payoutNoun: "Withdrawal",
  payoutNounPlural: "Withdrawals",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "Linked bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Staff your chairs in minutes.",
  consoleSubheading:
    "Fund your Dental Dynamics wallet, post the shifts you can cover, hire trusted temp staff, and withdraw earnings — all from a single console.",
} as const;

export type Branding = typeof branding;
