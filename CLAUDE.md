# Claude Code — root-sandbox-sdk

This is the Generic Root Payouts Template. [`AGENTS.md`](AGENTS.md) is the single source of truth
for all AI agents working in this repo. Read it before any task.

## Quick orientation

- **UI layer** (you may edit): `app/`, `components/`
- **Contract layer** (read-only except `branding.ts`): `lib/branding.ts`, `lib/hooks/`, `app/actions/`, `lib/types/`
- **Core layer** (never touch): `lib/root-api.ts`, `lib/redis.ts`, `lib/session.ts`, `lib/admin-session.ts`

## Hard rules (from AGENTS.md)

1. NEVER call `fetch('/api/...')` from a component — use `lib/hooks/*` or `app/actions/*`
2. NEVER import `@root-credit/root-sdk` or `@/lib/root-api` in a `'use client'` file
3. NEVER rename `Payer`, `Payee`, `Payout`, `PaymentRail`, `PayoutStatus`, `Transaction` — reskin via `lib/branding.ts` only
4. NEVER represent money in dollars in storage — always integer cents (`Money` type)
5. NEVER hardcode payment rail strings — use `PaymentRail` const enum from `lib/types/payments`
6. ALWAYS start new dashboard pages with `useSession()` + redirect to `/login` if `session === undefined`

## Verification

After any change: `pnpm typecheck` (must pass with zero errors)
After editing hooks/actions: `pnpm verify-contract`

## Prompts library

See [`prompts/`](prompts/) for paste-ready task prompts and [`prompts/00-launch/PROMPT.md`](prompts/00-launch/PROMPT.md) for
the master prompt to start a new vertical from scratch.
