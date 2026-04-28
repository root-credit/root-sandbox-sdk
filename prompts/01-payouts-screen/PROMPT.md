# Prompt — Build a payouts screen

Paste the block below into v0 (or any LLM with this repo as context).

---

I want a screen that lets the operator run an end-of-shift batch payout to all
{branding.payeePlural}. Use the existing contract layer; do not write any new
fetch calls or new types.

## Files to read first

- `AGENTS.md` (entire file)
- `lib/branding.ts`
- `lib/types/payout.ts`
- `lib/hooks/useProcessPayout.ts`
- `lib/hooks/usePayees.ts`
- `app/dashboard/payouts/page.tsx` (existing reference)

## Hard rules

- NEVER call `fetch('/api/...')`.
- NEVER import `@root-credit/root-sdk` or `@/lib/root-api`.
- NEVER hardcode "Restaurant", "Worker", "Tip" — use `branding.*`.
- NEVER represent money in dollars in storage; UI may collect dollars but the
  hook converts to cents.
- Use `useProcessPayout()` for the mutation, `usePayees(merchantId)` for the list,
  and `useSession()` for the merchant id.

## Build

Create `app/dashboard/<your-feature>/page.tsx` (a `'use client'` component) that:

1. Reads the session via `useSession()` and redirects to `/login` if absent.
2. Lists payees with `usePayees(merchantId)`.
3. Renders one editable amount input per payee (right-aligned, `font-mono-tab`,
   placeholder `0.00`).
4. Sums the entered amounts client-side for display.
5. On submit, calls `useProcessPayout().processPayout({ merchantId, lineItems,
   totalAmount })`. Filter out rows where amount === 0.
6. Shows the per-line `result.results` after success — green pill if status ===
   'success', red pill if 'failed', error message inline.

Match the visual language of the existing dashboard (eyebrow text, gold accent
on totals, sticky dark summary card).

Verify by running `pnpm verify-contract && pnpm typecheck`.
