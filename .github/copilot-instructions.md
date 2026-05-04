# GitHub Copilot workspace instructions — root-sandbox-sdk

This is the Generic Root Payouts Template built on Next.js App Router + `@root-credit/root-sdk`.
Read `AGENTS.md` and `LLM-SDK.md` for the full contract. Key points below.

## What you may edit (UI layer)

`app/`, `components/` — pages, layouts, and presentational components.

## What you must not edit

- `lib/root-api.ts`, `lib/redis.ts`, `lib/session.ts` — server-only core
- `lib/types/*` — domain types and Zod schemas
- `lib/hooks/*` — typed React hooks
- `app/actions/*` — server actions
- `app/api/*` — thin route handler delegates

## Hard rules

1. Never call `fetch('/api/...')` from a component — use `lib/hooks/*` or `app/actions/*`
2. Never import `@root-credit/root-sdk` or `@/lib/root-api` in `'use client'` files
3. Never rename `Payer`, `Payee`, `Payout`, `PaymentRail`, `PayoutStatus`, `Transaction` in code
4. All money is integer cents (`Money` type) — use `dollarsToCents` / `centsToDollars` / `formatMoney`
5. Use `PaymentRail` const enum — never hardcode rail strings
6. New dashboard pages must start with `useSession()` + redirect to `/login`

## Reskinning

Edit only `lib/branding.ts`. All 14 keys must be updated. See `prompts/00-launch/PROMPT.md`
for the complete business definition template and per-page instructions.

## Verification

`pnpm typecheck` — zero errors required after every change.
