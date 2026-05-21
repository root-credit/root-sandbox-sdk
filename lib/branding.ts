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
  productName: "Airbnb",
  /** One-line tagline used on landing + auth panels. */
  tagline: "List your space. Book unique stays. Get paid instantly.",
  /** Payer entity (the user who logs in, funds the wallet, and books stays). */
  payerSingular: "Guest",
  payerPlural: "Guests",
  /** Used in possessive contexts: e.g. "your guest's bank". */
  payerPossessive: "guest's",
  /** Payee entity (the destination where the user moves funds out of their wallet). */
  payeeSingular: "Payout destination",
  payeePlural: "Payout destinations",
  /** Payout terminology — moving funds OUT of the Airbnb Wallet. */
  payoutVerb: "Pay out",
  payoutNoun: "Payout",
  payoutNounPlural: "Payouts",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "User's bank account",
  funderShortLabel: "Bank account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Your travel dashboard awaits.",
  consoleSubheading:
    "Manage your Airbnb Wallet, list properties for rent, and discover unique stays from one place.",
  /** Wallet name - the label shown on wallet tab, balance card, and subaccount references. */
  walletName: "Airbnb Wallet",
} as const;

export type Branding = typeof branding;
