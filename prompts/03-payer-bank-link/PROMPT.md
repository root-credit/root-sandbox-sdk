# Prompt — Build a payer bank-link screen

Paste the block below into v0.

---

I want a screen where the {branding.payerSingular} can link the funding bank
account that pays out to {branding.payeePlural}. Use the existing contract layer.

## Files to read first

- `AGENTS.md`
- `lib/branding.ts`
- `lib/types/payer.ts`
- `lib/hooks/usePayer.ts`
- `components/BankAccountForm.tsx` (existing reference)
- `app/dashboard/payer/page.tsx` (existing reference)

## Hard rules

- NEVER call `fetch('/api/payer/bank-account')`.
- Use `usePayer()` to read the current payer record (so you can show
  "Bank linked" / unlinked status) and `useLinkBank()` to submit.
- The form is `react-hook-form` + `linkBankInputSchema`.
- Use `branding.funderLabel` as the section heading where appropriate.

## Build

Create or extend `app/dashboard/payer/page.tsx`:

1. Read the payer via `usePayer()`. While loading, render a skeleton.
2. Top section: profile read-out (`payerName`, `payerEmail`, `phone`,
   `rootPayerId`). Render a "Bank linked" badge when `payer.bankAccountToken`
   is present.
3. Second section: the bank-link form. Fields: `accountHolderName`,
   `routingNumber` (9 digits), `accountNumber` (password), `accountType`
   (`checking` | `savings`).
4. Submit calls `linkBank(payerId, data)`. On success, refresh the payer
   so the "Bank linked" badge appears.

Verify with `pnpm typecheck`.
