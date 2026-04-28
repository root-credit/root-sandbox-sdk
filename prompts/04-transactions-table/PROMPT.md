# Prompt — Build a transactions table

Paste the block below into v0.

---

I want a paginated, filterable transactions ledger that shows every payout the
merchant has made. Use the existing contract layer.

## Files to read first

- `AGENTS.md`
- `lib/branding.ts`
- `lib/types/payout.ts`
- `lib/hooks/useTransactions.ts`
- `lib/types/payments.ts` (for `formatMoney`)
- `app/dashboard/transactions/page.tsx` (existing reference)

## Hard rules

- NEVER call `fetch('/api/payouts?merchantId=...')`.
- Use `useTransactions(merchantId)`.
- Render money via `formatMoney(transaction.amountCents)`. Do not divide by 100
  inline; use `centsToDollars` only when arithmetic in dollars is needed.
- Status pill colors come from a small `statusVariant` map; do not invent new
  status strings — use values from `PayoutStatus`.

## Build

Page at `app/dashboard/<feature>/page.tsx`:

1. `useSession()` → redirect if unauthenticated.
2. `useTransactions(merchantId)` for the data.
3. Stats strip on top: total paid out (formatted), successful count, total count.
4. Table with columns: Payee, Email, Amount (right-aligned, monospace), Status
   (pill), Date.
5. Empty state with CTA to `/dashboard/payouts`.
6. Optional: client-side filter by status (`completed` | `pending` | `failed`).

Verify with `pnpm typecheck`.
