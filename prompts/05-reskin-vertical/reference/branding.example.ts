/**
 * Example reskin — freelance marketplace.
 *
 * Drop these values into `lib/branding.ts` to flip the entire app from
 * restaurant-tipping to freelance settlements without touching any code.
 */
export const branding = {
  productName: "Pencil",
  tagline: "Pay your freelancers the moment the project ships.",
  merchantSingular: "Studio",
  merchantPlural: "Studios",
  merchantPossessive: "studio's",
  payeeSingular: "Freelancer",
  payeePlural: "Freelancers",
  payoutVerb: "Settle",
  payoutNoun: "Project payout",
  payoutNounPlural: "Project payouts",
  funderLabel: "Studio funding bank",
  funderShortLabel: "Bank account",
  consoleHeading: "Welcome back. Time to ship the invoices.",
  consoleSubheading:
    "Manage your studio, your roster, and this week's project settlements from a single console.",
} as const;

export type Branding = typeof branding;
