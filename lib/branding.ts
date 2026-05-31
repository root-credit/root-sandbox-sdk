/**
 * Vertical-facing copy for the Coinbase crypto wallet template.
 *
 * Reskinning rules:
 *   - Domain types and APIs (Payer, Payee, PaymentRail, etc.) MUST NOT change at file paths.
 *   - All user-visible labels for the active vertical live here.
 *
 * v0 / LLM contract: when asked to "reskin the vertical" or "rename the product",
 * edit ONLY this file.
 */
export const branding = {
  /** Top-level product name shown in nav, footer, browser title. */
  productName: 'Coinbase',
  /** One-line tagline used on landing + auth panels. */
  tagline: 'Buy and sell crypto. Cash out instantly.',
  /** The name of the in-app wallet shown everywhere. */
  walletName: 'Coinbase Cash Balance',
  /** Payer entity (the user who logs in, funds the wallet, and trades crypto). */
  payerSingular: 'Account',
  payerPlural: 'Accounts',
  /** Used in possessive contexts: e.g. "your account's bank". */
  payerPossessive: "account's",
  /** Payee entity (the destination where the user moves funds out of their wallet). */
  payeeSingular: 'Recipient',
  payeePlural: 'Recipients',
  /** Payout terminology — moving funds OUT of the wallet. */
  payoutVerb: 'Cash out',
  payoutNoun: 'Cash out',
  payoutNounPlural: 'Cash outs',
  /** Funding source label on the wallet settings screen. */
  funderLabel: 'Linked bank account',
  funderShortLabel: 'Bank account',
  /** Console heading displayed on the dashboard home. */
  consoleHeading: 'Welcome to Coinbase.',
  consoleSubheading:
    'Buy and sell crypto, manage your Coinbase Cash Balance, and cash out to your bank or debit card — all in one place.',
} as const;

export type Branding = typeof branding;
