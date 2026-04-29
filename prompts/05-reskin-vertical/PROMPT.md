# Prompt — Reskin to a different vertical

Paste the block below into v0.

---

I want to reskin this app from "restaurant tipping" to "<your vertical>" — for
example a freelance marketplace where {payerSingular} is "Studio" and
{payeeSingular} is "Freelancer", or a payroll app where they are "Employer" and
"Employee".

## Files to read first

- `AGENTS.md` (the "Reskin a vertical" recipe)
- `lib/branding.ts`
- `.cursor/rules/branding.mdc`
- `app/page.tsx` (landing — only marketing prose changes)
- `app/layout.tsx` (metadata is already branded)

## Hard rules

- Edit ONLY `lib/branding.ts`.
- Optional: rewrite the marketing copy on `app/page.tsx` (hero headline,
  Module Receipt feature lists, How-it-works steps).
- Do NOT rename `Payer` / `Payee` / `Payout` / `PaymentRail` / `Transaction`
  in code.
- Do NOT change Redis key prefixes (`payer:*`, `payee:*`, `transaction:*`).
- Do NOT touch `lib/types/*`, `lib/hooks/*`, `app/actions/*`, route handlers.

## Build

1. Open `lib/branding.ts`.
2. Replace the values for `productName`, `tagline`, `payerSingular`,
   `payerPlural`, `payerPossessive`, `payeeSingular`, `payeePlural`,
   `payoutNoun`, `payoutNounPlural`, `funderLabel`, `funderShortLabel`,
   `consoleHeading`, `consoleSubheading`.
3. Optional: rewrite the marketing prose on `app/page.tsx`. Keep the structural
   components (hero grid, Module Receipt cards, How-it-works steps).
4. Run `pnpm typecheck` — it should pass with zero changes elsewhere.
5. Run `pnpm dev` and click through `/login`, `/signup`, `/dashboard/*`. Every
   user-visible noun should reflect the new vertical.

If a string anywhere outside these files still says the old vertical, that is a
bug in the template — file an issue or open a PR adding a `branding.*` lookup.
