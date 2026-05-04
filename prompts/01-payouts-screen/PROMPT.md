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
- Use `useProcessPayout()` for the mutation, `usePayees(payerId)` for the list,
  and `useSession()` for the payer id.

## Build

Create `app/dashboard/<your-feature>/page.tsx` (a `'use client'` component) that:

1. Reads the session via `useSession()` and redirects to `/login` if absent.
2. Lists payees with `usePayees(payerId)`.
3. Renders one editable amount input per payee (right-aligned, `font-mono-tab`,
   placeholder `0.00`).
4. Sums the entered amounts client-side for display.
5. On submit, calls `useProcessPayout().processPayout({ payerId, lineItems,
   totalAmount })`. Filter out rows where amount === 0.
6. Shows the per-line `result.results` after success — green pill if status ===
   'success', red pill if 'failed', error message inline.

Match the visual style of the existing dashboard — use the same Card, Badge, and Button
components and spacing patterns found in app/dashboard/payouts/page.tsx.

Verify by running `pnpm verify-contract && pnpm typecheck`.
