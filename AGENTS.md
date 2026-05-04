# AGENTS.md — Generic Root Payouts Template

This document is the single source of truth for any LLM, agent, or AI tooling working
in this repository (Cursor, v0, Claude, Codex, ChatGPT, etc.). Read it once at the
start of any task. Re-read it before generating new pages or refactoring.

> **One-line mental model:**
> The AI agent only writes UI. The contract layer (`lib/types`, `lib/hooks`, `app/actions`)
> handles every Root payments interaction deterministically.

**Agent context files:** Agent-specific setup files ([`CLAUDE.md`](CLAUDE.md) for Claude Code, [`.windsurfrules`](.windsurfrules) for Windsurf, [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for Copilot) point here. For Cursor, see [`.cursor/rules/`](.cursor/rules/) and `.cursor/skills/`.

## Hard rules

These are non-negotiable. The `pnpm verify-contract` script will fail CI if any of
the first three are violated.

```text
NEVER call fetch('/api/...') from a component.
  → Use a hook in `lib/hooks/*` or call a server action in `app/actions/*`.

NEVER import `@root-credit/root-sdk` from a `'use client'` component.
  → SDK calls live in `lib/root-api.ts` (server-only) and are exposed via actions.

NEVER import `@/lib/root-api` (or `lib/root-api`) from a client component.
  → Same reason; this module instantiates the SDK with secrets.

NEVER rename a type from `lib/types/*` to fit a new vertical.
  → Reskin via `lib/branding.ts` only. Type names (`Payer`, `Payee`, `Payout`,
    `PaymentRail`, `PayoutStatus`) are stable across verticals.

NEVER represent money in dollars.
  → All money is integer cents (`Money` from `lib/types/payments`). Use
    `dollarsToCents`, `centsToDollars`, `formatMoney` at the display boundary only.

NEVER hardcode payment rails as string literals.
  → Use the `PaymentRail` const enum from `lib/types/payments`.

NEVER store secrets in client code or commit `.env.local`.
  → All secrets (`ROOT_API_KEY`, `UPSTASH_*`) live in env vars consumed by the
    server-only modules.
```

## Layered architecture

```
┌─────────────────────────────────────────────────────────────┐
│ UI layer (agent-editable)                                   │
│  app/* pages and components                                 │
│  components/*                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ imports only ↓
┌──────────────────────────▼──────────────────────────────────┐
│ Deterministic contract (LLM imports only here for payments) │
│  lib/branding.ts        ← user-visible labels (vertical)   │
│  lib/hooks/*.ts         ← typed React hooks (client)       │
│  app/actions/*.ts       ← typed Server Actions             │
│  lib/types/*.ts         ← Zod schemas + TS types + enums   │
└──────────────────────────┬──────────────────────────────────┘
                           │ ↓
┌──────────────────────────▼──────────────────────────────────┐
│ Vertical-agnostic core (server-only — never client)         │
│  lib/session.ts                                             │
│  lib/redis.ts           ← Upstash + storage primitives     │
│  lib/root-api.ts        ← @root-credit/root-sdk wrapper    │
│  lib/admin-session.ts                                       │
│  lib/app-settings.ts                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ ↓
                External: api.useroot.com, Upstash, Root SDK
```

## Contract surface table

The full list of "things the AI agent may import". Anything else is implementation detail.

### Domain types (`lib/types/*` — `import { … } from '@/lib/types'`)

| Symbol | Kind | Purpose |
| --- | --- | --- |
| `Payer` | type | Persisted payer record (funding party) |
| `signupPayerInputSchema` / `SignupPayerInput` | zod + type | Signup form |
| `loginInputSchema` / `LoginInput` | zod + type | Login form |
| `linkBankInputSchema` / `LinkBankInput` | zod + type | Bank-linking form |
| `Payee` | type | Persisted payee record |
| `createPayeeInputSchema` / `CreatePayeeInput` | zod + type | Add-payee form |
| `deletePayeeInputSchema` / `DeletePayeeInput` | zod + type | Remove-payee body |
| `Transaction` | type | Persisted ledger entry |
| `processPayoutInputSchema` / `ProcessPayoutInput` | zod + type | Payout batch input |
| `payoutLineItemSchema` / `PayoutLineItem` | zod + type | Single payout row |
| `processPayoutResultSchema` / `ProcessPayoutResult` | zod + type | Payout batch result |
| `PaymentRail` | const enum | `instant_bank` / `instant_card` / `same_day_ach` / `standard_ach` / `wire` |
| `PayoutStatus` | const enum | `pending` / `completed` / `success` / `failed` |
| `PaymentMethodType` | const enum | `bank_account` / `debit_card` |
| `Money` (`number`) | type | Always integer cents |
| `dollarsToCents`, `centsToDollars`, `formatMoney` | function | Money helpers |

### Server Actions (`app/actions/*` — `import { … } from '@/app/actions/<file>'`)

| Action | Module | Purpose |
| --- | --- | --- |
| `signIn(input)` | `app/actions/auth.ts` | Payer login (sets cookie) |
| `signUp(input)` | `app/actions/auth.ts` | Payer signup (sets cookie) |
| `signOut()` | `app/actions/auth.ts` | Clears the session cookie |
| `getCurrentPayer()` | `app/actions/payer.ts` | Read current payer record |
| `linkPayerBank(payerId, input)` | `app/actions/payer.ts` | Attach funding bank |
| `listPayees(payerId)` | `app/actions/payees.ts` | List payees |
| `createPayee(payerId, input)` | `app/actions/payees.ts` | Onboard a payee |
| `removePayee(payerId, input)` | `app/actions/payees.ts` | Remove a payee |
| `processPayout(input)` | `app/actions/payouts.ts` | Batch payout |
| `listTransactions(payerId)` | `app/actions/transactions.ts` | Read ledger |

### Hooks (`lib/hooks/*` — `import { … } from '@/lib/hooks'`)

| Hook | Returns | Use in |
| --- | --- | --- |
| `useSession()` | `{ session, isLoading, error }` | Any client component needing the payer id/email |
| `usePayer()` | `{ payer, isLoading, error, refresh }` | Payer settings / profile |
| `useLinkBank()` | `{ linkBank, isSubmitting, error }` | Bank-link form |
| `usePayees(payerId)` | `{ payees, isLoading, error, refresh, setPayees }` | Payee list / payout form |
| `useCreatePayee()` | `{ createPayee, isSubmitting, error }` | Add-payee form |
| `useRemovePayee()` | `{ removePayee, isSubmitting, error }` | Payee row "remove" button |
| `useTransactions(payerId)` | `{ transactions, isLoading, error, refresh }` | Transactions table |
| `useProcessPayout()` | `{ processPayout, isProcessing, error, lastResult }` | Payout form |
| `useLogin()` | `{ login, isSubmitting, error }` | Login form |
| `useSignup()` | `{ signup, isSubmitting, error }` | Signup form |
| `useLogout()` | `{ logout, isSubmitting }` | Header / nav sign-out |
| `useAdminAuth()` | `{ authorized, login, logout, refresh, … }` | `AdminPanel` (operator tooling) |
| `useAdminPayees()` | `{ payees, refresh, setPayees }` | Admin payee list |
| `useAdminOperations()` | `{ run, busy, error }` | Admin Redis operations |

### Branding (`lib/branding.ts`)

Single source of vertical-facing copy. To re-skin from "restaurant tipping" to a
new vertical (marketplace settlements, payroll, freelance, refunds), edit ONLY this
file. Do not rename Payer/Payee/Payout symbols anywhere else.

```ts
import { branding } from '@/lib/branding';

branding.productName          // e.g. "Roosterwise"
branding.payerSingular        // e.g. "Restaurant"
branding.payerPlural
branding.payeeSingular        // e.g. "Worker"
branding.payeePlural
branding.payoutNoun           // e.g. "Tip payout"
branding.payoutNounPlural
branding.funderLabel          // e.g. "Restaurant bank account"
```

## Recipe — Add a new dashboard page

Goal: add `/dashboard/<feature>` that shows X and submits Y.

1. **Pick the data**. Identify which existing hook(s) supply the data and which
   action(s) submit it. If a brand-new mutation is needed, add it to
   `app/actions/<feature>.ts` AND a hook in `lib/hooks/use<Feature>.ts`.
2. **Create the page** at `app/dashboard/<feature>/page.tsx`:
   - Mark `'use client'` if it uses any hook.
   - Always start with `useSession()` and redirect to `/login` if `session === undefined`.
   - Read all data through hooks. Never call `fetch('/api/...')`.
   - Pull all user-visible nouns from `lib/branding.ts`.
3. **Add the nav entry** in `components/DashboardHeader.tsx` `NAV` array.
4. **Verify**: `pnpm verify-contract && pnpm typecheck`.

Reference implementations: `app/dashboard/payouts/page.tsx`,
`app/dashboard/payees/page.tsx`, `app/dashboard/transactions/page.tsx`.

## Recipe — Reskin to a new vertical

Goal: make this app feel like "freelance marketplace" instead of "restaurant tipping".

1. **Edit `lib/branding.ts`** only. Update `productName`, `payerSingular/Plural`,
   `payeeSingular/Plural`, `payoutNoun/Plural`, `funderLabel`, `tagline`,
   `consoleHeading`, `consoleSubheading`.
2. **Optional**: rewrite the marketing copy on `app/page.tsx` (landing). The
   structural components stay; only prose changes.
3. **Optional**: update `app/layout.tsx` metadata (it already reads from `branding`).
4. **Do NOT** touch `lib/types/*`, `app/actions/*`, `lib/hooks/*`, `lib/redis.ts`,
   `lib/root-api.ts`, route handlers, or any Redis key prefixes.
5. **Verify**: `pnpm typecheck && pnpm dev` and click through the console.

## Recipe — Add a new payment rail or status

Goal: support `wire_priority` as a new rail.

1. Add `WirePriority: 'wire_priority'` to `PaymentRail` in `lib/types/payments.ts`
   AND extend `paymentRailSchema`.
2. Update `payoutRailForPayee` in `lib/root-api.ts` if the new rail has different
   selection logic.
3. Update `lib/hooks/*` only if a new hook ergonomics is needed (rare).
4. UI uses the new value via `PaymentRail.WirePriority` — no string literals.

## Recipe — Add a Root webhook listener

Goal: react to payout completion / failure events from Root.

1. Create `app/api/webhooks/root/route.ts` exporting `POST`.
2. Verify the webhook signature against `process.env.ROOT_WEBHOOK_SECRET`.
3. On `payout.completed`, look up the matching transaction (by `rootPayoutId`) and
   call `setTransaction` to update its `status`. Do NOT mutate via routes; mutate
   via a server action so revalidation is centralized.
4. Add the secret key to `.env.example` with a comment.

## Operational notes

- Redis keys for operators use prefixes `payer:*`, `payee:*`, `transaction:*`,
  `session:*`. Changing prefixes invalidates existing Upstash data; flush Redis when
  renaming migrations aren’t applied.
- The dev server auto-reloads on changes to `app/`, `components/`, `lib/`.
- Server actions that mutate Redis MUST call `revalidatePath` for the relevant
  dashboard segment(s). The included actions already do this.
- The route handlers under `app/api/*` are kept as thin delegators around the
  server actions. They exist only for non-React HTTP clients (CLI scripts,
  external webhooks). Do NOT add new business logic to them.
- The hardcoded admin email is `admin@root.credit`. The login route handler
  short-circuits this email to bypass Redis. The AI agent should never special-case
  this email in client code.

## SDK reference

For deeper details on the underlying `@root-credit/root-sdk` (payment objects,
metadata fields, idempotency, error handling), read the SDK cheat sheet at
[`sdk/LLM.md`](sdk/LLM.md). Start with the **Monorepo template** section there for how **`lib/root-api.ts`**, **`app/actions`**, and **`lib/hooks`** map to this repo (vs. standalone `app/lib/root.ts`). It's also mirrored at the repo root as
[`LLM-SDK.md`](LLM-SDK.md) so AI agents can pick it up automatically.

## When in doubt

Open the prompt library at [`prompts/`](prompts). Each numbered directory has a
`PROMPT.md` (paste-ready text), a `reference/` folder (the canonical files the
prompt should produce), and `notes.md` (gotchas + how the contract layer prevents
common mistakes).
