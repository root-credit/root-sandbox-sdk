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
 * Active vertical: Roosterwise — instant tip payouts for hospitality. The payer is
 * the restaurant manager/operator who funds a Roosterwise wallet from the
 * restaurant's operating account and pushes instant tip payouts to the crew at
 * the end of every shift.
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: "Roosterwise",
  /** One-line tagline used on landing + auth panels. */
  tagline: "Instant tip payouts for your crew. After every shift.",
  /** Payer entity (the restaurant manager who logs in, funds the wallet, sends tips). */
  payerSingular: "Restaurant",
  payerPlural: "Restaurants",
  /** Used in possessive contexts: e.g. "your restaurant's operating account". */
  payerPossessive: "restaurant's",
  /** Payee entity (the worker — server, bartender, runner — who receives tips). */
  payeeSingular: "Worker",
  payeePlural: "Workers",
  /** Payout terminology — moving funds OUT of the Roosterwise wallet to crew. */
  payoutVerb: "Send tips",
  payoutNoun: "Tip payout",
  payoutNounPlural: "Tip payouts",
  /** Funding source label on the wallet settings screen. */
  funderLabel: "Restaurant operating account",
  funderShortLabel: "Operating account",
  /** Console heading displayed on the dashboard home. */
  consoleHeading: "Welcome back. Tonight's tips are ready to go.",
  consoleSubheading:
    "Manage your crew, fund your Roosterwise wallet from your operating account, and push instant tip payouts the moment a shift ends.",
} as const;

export type Branding = typeof branding;
