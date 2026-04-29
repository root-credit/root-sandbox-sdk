<!--
  This file is a verbatim mirror of `sdk/LLM.md`, hoisted to the repo root so
  v0's default project context picks it up automatically (v0 ingests root-level
  Markdown by default, but does not recurse into vendored package directories).

  The canonical source is `sdk/LLM.md` and any changes should be made there.
  Keep this file byte-identical to the source — `pnpm verify-contract` will
  warn on drift if you wire that check in later.
-->
# `@useroot/sandbox-sdk` — V0 Integration Cheat-Sheet

> Paste this file (or its contents) into the v0 system prompt / project context so the model wires Root payments correctly on the first try.

You are generating a Next.js App Router demo app that talks to the Root sandbox.
**You MUST use the `@root-credit/root-sdk` npm package for every Root API call.**
Do **not** call `fetch` against `api.useroot.com` directly. Do **not** invent your own client.

### Architecture — browser vs server (no Express on Vercel)

- **The browser must not call Root with `ROOT_API_KEY`.** That key is a secret. If the UI imported the SDK or called `https://api…` with `X-API-KEY` from client-side JS, anyone could steal it from the bundle or DevTools. Root’s API is meant for **server-to-server** use with the key in environment variables.
- **Vercel does not require Express.** A v0-generated **Next.js App Router** app runs the SDK on the **server**: **Server Actions** (`'use server'`), **Route Handlers** (`app/api/.../route.ts`), or **Server Components**. Those execute in Node on Vercel and read `process.env.ROOT_API_KEY`. The **frontend** only renders UI and triggers Server Actions or `fetch('/api/...')` to *your* app — your route/action then calls `root.payees.create(...)` etc. That matches your goal: **LLM focuses on UI**; **all Root traffic goes through the SDK on the server**.

---

## Setup the AI must include in every project

1. Add to `package.json` dependencies:

   ```json
   "@root-credit/root-sdk": "^0.1.0"
   ```

2. `.env.local`:

   ```env
   # Full token string: test_<uuid>_<secret> or live_<uuid>_<secret> — NOT a bare UUID
   ROOT_API_KEY=test_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_yoursecret
   ROOT_BASE_URL=https://api.useroot.com
   ROOT_DEFAULT_SUBACCOUNT_ID=<optional>
   ```

3. Create exactly one server-only Root client at `app/lib/root.ts`:

   ```ts
   import 'server-only'
   import { Root } from '@root-credit/root-sdk'
   export const root = new Root()
   ```

   Import `root` only from server modules (Server Actions, Route Handlers, RSC). NEVER from a client component. The API key must never reach the browser.

---

## Hard rules

- **Auth:** never write `Authorization: Bearer …`, never read `ROOT_API_KEY` yourself, never set the `X-API-KEY` header. The SDK does it. The env value must be the **full** API token (`test_<uuid>_<secret>` / `live_<uuid>_<secret>`), not a UUID alone.
- **Base URL:** never hardcode `api.useroot.com`. The SDK reads `ROOT_BASE_URL` from env.
- **Money:** always `amount_in_cents` (integer). Do **not** convert to dollars before passing to the SDK.
- **Auto-approve:** the SDK already defaults `auto_approve: true`. Do not flip it to `false` unless the demo specifically pitches a manual-approval flow.
- **Polling:** never write your own `setInterval` poller. Call `root.payouts.waitForTerminal(id, { rail })` or `root.payins.waitForTerminal(id, { rail })`.
- **Test data:** never hardcode random bank/card numbers. Use the constants exported from the SDK: `ALLOWED_TEST_ACCOUNT_NUMBERS`, `ALLOWED_TEST_ROUTING_NUMBERS`, `ALLOWED_TEST_CARD_NUMBERS`, `TEST_CARD_EXPIRY`. The SDK already uses these as defaults.
- **Failure simulation:** to demo a failure, set `simulateFailure: true` on `flows.payTo` / `flows.chargeFrom`, or pass the payee name `'John Failed'`. That is the ONLY name that fails in sandbox.
- **Response unwrapping:** the SDK already unwraps `{ data: … }` for single-object responses. `await root.payees.create(...)` returns the `Payee`, not `{ data: Payee }`.
- **Allowed payin rails:** only `'standard_ach'` and `'same_day_ach'`. The SDK types enforce this.

---

## Preferred: high-level flows (use these whenever possible)

A money-out demo (payout) — one call replaces 4–5 manual API requests:

```ts
'use server'
import { root } from '@/app/lib/root'

export async function payEmployee(employee: { name: string; email: string; amountInCents: number }) {
  const result = await root.flows.payTo({
    payee: { name: employee.name, email: employee.email },
    amount_in_cents: employee.amountInCents,
    rail: 'instant_bank',     // or 'same_day_ach', 'standard_ach', 'wire', 'instant_card'
    waitForTerminal: true,    // default; resolves only when the payout is paid/failed
    onStatus: (status) => console.log('payout status:', status),
  })
  return result.finalPayout   // { id, status, amount_in_cents, ... }
}
```

A money-in demo (payin) — ACH only:

```ts
const result = await root.flows.chargeFrom({
  payer: { name: 'Acme Buyer', email: 'ap@acme.com' },
  amount_in_cents: 99_900,
  rail: 'standard_ach',
})
return result.finalPayin
```

### Existing payer payin + subaccount move (skip payer onboarding)

Use these when the Root payer already exists and already has a pay-by-bank method attached — avoids duplicating `flows.chargeFrom`.

```ts
const move = await root.flows.moveBetweenSubaccounts({
  from_subaccount_id: fromId,
  to_subaccount_id: toId,
  amount_in_cents: 5_000,
})

const { finalPayin } = await root.flows.fundSubaccountFromExistingPayer({
  payer_id: rootPayerId,
  amount_in_cents: 25_000,
  rail: 'standard_ach', // or 'same_day_ach'
  subaccount_id: subaccountId,
})
```

Optional: pass `{ subaccount_id }` as the third argument query when attaching pay-by-bank so the PM is scoped to that bucket:

```ts
await root.payers.attachPayByBank(
  payerId,
  { account_number: '…', routing_number: '…' },
  { subaccount_id: subaccountId, is_default: true },
)
```

---

## Resource methods (for fine-grained control)

Always go through `root.<resource>.<method>`. Available resources:

| Resource | Common methods |
|---|---|
| `root.subaccounts` | `create`, `get`, `update`, `list`, `move`, `getOrCreateDefault` |
| `root.payees` | `create`, `get`, `list`, `update`, `findByEmail`, `attachPayToBank`, `attachPushToCard`, `listPaymentMethods`, `getPaymentMethod`, `setDefaultPaymentMethod`, `deletePaymentMethod` |
| `root.payers` | `create`, `get`, `list`, `update`, `findByEmail`, `attachPayByBank(id, body?, { is_default?, subaccount_id? })`, `listPaymentMethods`, `getPaymentMethod`, `getDefaultPaymentMethod`, `setDefaultPaymentMethod`, `deletePaymentMethod` |
| `root.payouts` | `create`, `get`, `list`, `cancel`, `waitForTerminal` |
| `root.payins` | `create`, `get`, `list`, `approve`, `cancel`, `waitForTerminal` |
| `root.webhooks` | `create`, `list`, `get`, `toggle`, `delete` |
| `root.sessionTokens` | `createForParty` |

**Manual payout (only when `flows.payTo` doesn't fit):**

```ts
const sub = await root.subaccounts.getOrCreateDefault()
const payee = (await root.payees.findByEmail(email)) ?? await root.payees.create({ name, email })
await root.payees.attachPayToBank(payee.id) // SDK uses sandbox-allowed defaults
const payout = await root.payouts.create({
  payee_id: payee.id,
  amount_in_cents: 12_500,
  rail: 'instant_bank',
  subaccount_id: sub.id,
})
const final = await root.payouts.waitForTerminal(payout.id, { rail: 'instant_bank' })
```

---

## Status helpers (use these in the UI)

```ts
import { statusLabel, isTerminal, isSuccess } from '@root-credit/root-sdk'

statusLabel(payout.status)  // 'Queued' | 'Sent to bank' | 'Processing' | 'Paid' | 'Failed' | 'Canceled' | 'Under review'
isTerminal(payout.status)   // boolean
isSuccess(payout.status)    // boolean — true only for 'settled' or 'debited'
```

---

## Error handling

Wrap calls in `try/catch`. The SDK throws `RootApiError` with `.status`, `.code`, `.body`, `.rawText`:

```ts
import { RootApiError } from '@root-credit/root-sdk'

try {
  await root.flows.payTo({ ... })
} catch (err) {
  if (err instanceof RootApiError) {
    console.error(err.status, err.code, err.body)
  }
  throw err
}
```

For polling timeouts, catch `RootPollTimeoutError` (from the same package) and surface "still processing" UX.

---

## What you MUST NOT do

- ❌ `fetch('https://api.useroot.com/...')` directly.
- ❌ Read `process.env.ROOT_API_KEY` in your own code.
- ❌ Build your own polling loop with `setInterval`.
- ❌ Hardcode bank/card/routing numbers other than `ALLOWED_TEST_*`.
- ❌ Pass dollars (e.g. `100.50`). Use `amount_in_cents: 10050`.
- ❌ Use `'instant_bank'`, `'instant_card'`, or `'wire'` on `payins.create` — payins are ACH-only.
- ❌ Import `root` (or `@root-credit/root-sdk`) into a `'use client'` component.
