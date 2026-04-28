# Prompt — Build a merchant bank-link screen

Paste the block below into v0.

---

I want a screen where the {branding.merchantSingular} can link the funding bank
account that pays out to {branding.payeePlural}. Use the existing contract layer.

## Files to read first

- `AGENTS.md`
- `lib/branding.ts`
- `lib/types/merchant.ts`
- `lib/hooks/useMerchant.ts`
- `components/BankAccountForm.tsx` (existing reference)
- `app/dashboard/merchant/page.tsx` (existing reference)

## Hard rules

- NEVER call `fetch('/api/merchant/bank-account')`.
- Use `useMerchant()` to read the current merchant record (so you can show
  "Bank linked" / unlinked status) and `useLinkBank()` to submit.
- The form is `react-hook-form` + `linkBankInputSchema`.
- Use `branding.funderLabel` as the section heading where appropriate.

## Build

Create or extend `app/dashboard/merchant/page.tsx`:

1. Read the merchant via `useMerchant()`. While loading, render a skeleton.
2. Top section: profile read-out (`merchantName`, `merchantEmail`, `phone`,
   `rootPayerId`). Render a "Bank linked" badge when `merchant.bankAccountToken`
   is present.
3. Second section: the bank-link form. Fields: `accountHolderName`,
   `routingNumber` (9 digits), `accountNumber` (password), `accountType`
   (`checking` | `savings`).
4. Submit calls `linkBank(merchantId, data)`. On success, refresh the merchant
   so the "Bank linked" badge appears.

Verify with `pnpm typecheck`.
