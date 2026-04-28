# @useroot/sandbox-sdk

A tiny, deterministic JS/TS SDK for the **Root Pay sandbox APIs**. Built so a v0-generated demo app can wire payments correctly with one or two lines of code, instead of the AI re-inventing auth, polling, and response-envelope handling on every prompt.

- **Zero runtime dependencies.** Native `fetch` only. Node 18+.
- **Deterministic.** Auth header, base URL, error class, response unwrapping, and rail-aware polling are all baked in.
- **Server-only.** The `X-API-KEY` must never reach the browser. Use the SDK from Server Actions, Route Handlers, RSC, or plain Node scripts.
- **Sandbox-aware.** Ships the allowed test bank/card/routing numbers, the `John Failed` magic name, and per-rail polling defaults.
- **Coverage:** subaccounts (incl. moves), payees + payee payment methods, payers + payer payment methods, payouts, payins, webhooks, party session tokens, plus high-level `flows.payTo` / `flows.chargeFrom` orchestrators.

---

## Install

```bash
pnpm add @useroot/sandbox-sdk
# or
npm i @useroot/sandbox-sdk
```

Set environment variables in your demo's `.env.local`:

```env
# Full API token (three segments). NOT a bare UUID — use the whole `token_value`:
ROOT_API_KEY=test_<token_id>_<secret>
ROOT_BASE_URL=https://api.useroot.com           # optional, this is the default
ROOT_DEFAULT_SUBACCOUNT_ID=<optional, pre-created subaccount id>
```

`ROOT_API_KEY` must match what the Root API expects: `test_<uuid>_<secret>` or `live_<uuid>_<secret>` (the value returned when you create an API token). A UUID by itself will return **`INVALID_TOKEN`** from the server.

---

## Quick start

### 1. Single-call payout (most common demo flow)

```ts
import { Root } from '@useroot/sandbox-sdk'

const root = new Root() // reads ROOT_API_KEY + ROOT_BASE_URL from env

const { finalPayout } = await root.flows.payTo({
  payee: { name: 'Quinn Ramirez', email: 'quinn@example.com' },
  amount_in_cents: 12_500,
  rail: 'instant_bank',
  // paymentMethod, subaccount_id, currency_code are all optional;
  // sandbox-allowed test bank defaults are used automatically.
})

console.log(finalPayout.status) // 'settled' (or 'failed' on the John Failed flow)
```

That single call:
1. Reuses the payee if one already exists with the same email; otherwise creates it.
2. Attaches a sandbox-allowed default pay-to-bank payment method.
3. Resolves a subaccount (env → list → create) and uses it.
4. Creates the payout with `auto_approve: true`.
5. Polls `GET /api/payouts/{id}` with the right interval/timeout for the chosen rail until terminal.

### 2. Single-call payin

```ts
const { finalPayin } = await root.flows.chargeFrom({
  payer: { name: 'Acme Buyer', email: 'ap@acme.com' },
  amount_in_cents: 99_900,
  rail: 'standard_ach', // payins only accept 'standard_ach' | 'same_day_ach'
})
```

### 3. Resource-style usage (when you want full control)

```ts
const subaccount = await root.subaccounts.getOrCreateDefault()

const payee = await root.payees.create({ name: 'Morgan Liu', email: 'm@example.com' })
const pm = await root.payees.attachPayToBank(payee.id) // sandbox defaults

const payout = await root.payouts.create({
  payee_id: payee.id,
  amount_in_cents: 5_000,
  rail: 'same_day_ach',
  subaccount_id: subaccount.id,
})

const final = await root.payouts.waitForTerminal(payout.id, {
  rail: 'same_day_ach',
  onUpdate: (snap) => console.log('status:', snap.status),
})
```

### 4. Failure simulation

```ts
import { FAILURE_SIMULATION_NAME, payeeNameForTransaction } from '@useroot/sandbox-sdk'

await root.flows.payTo({
  payee: { name: 'Quinn Ramirez', email: 'quinn@example.com' },
  amount_in_cents: 1234,
  rail: 'instant_bank',
  simulateFailure: true, // swaps the payee name to 'John Failed' for this transfer
})
```

---

## Next.js (App Router) integration

The SDK is server-only. Construct it inside a server module and call from Server Actions, Route Handlers, or RSC:

```ts
// app/lib/root.ts
import 'server-only'
import { Root } from '@useroot/sandbox-sdk'

export const root = new Root()
```

```ts
// app/actions.ts
'use server'
import { root } from './lib/root'

export async function runPayout(formData: FormData) {
  const amount = Number(formData.get('amount'))
  return root.flows.payTo({
    payee: { name: 'Quinn Ramirez', email: 'q@example.com' },
    amount_in_cents: amount,
    rail: 'instant_bank',
  })
}
```

---

## API surface (high-level)

```
new Root({ apiKey?, baseUrl?, timeoutMs?, maxRetries?, onRequest?, defaultHeaders? })

root.subaccounts
  .create({ name })
  .get(id)
  .update(id, { name })
  .list({ limit?, cursor?, ... })
  .move({ from_subaccount_id, to_subaccount_id, amount_in_cents })
  .getOrCreateDefault({ name?, envVar? })          // env → list → create

root.payees
  .create({ name, email, metadata? }) / .get(id) / .list(params)
  .update(id, { name?, email?, metadata? })
  .findByEmail(email)
  .attachPayToBank(id, { account_number?, routing_number?, routing_number_type? })
  .attachPushToCard(id, { card_number?, card_expiry_date? })
  .listPaymentMethods(id) / .getPaymentMethod(id, pmId)
  .setDefaultPaymentMethod(id, pmId) / .deletePaymentMethod(id, pmId)

root.payers
  .create / .get / .list / .update / .findByEmail
  .attachPayByBank(id, body?, { is_default? })
  .listPaymentMethods / .getPaymentMethod / .getDefaultPaymentMethod
  .setDefaultPaymentMethod / .deletePaymentMethod

root.payouts
  .create({ payee_id, amount_in_cents, rail, subaccount_id?, auto_approve?=true, currency_code?='USD', metadata? })
  .get(id) / .list(params) / .cancel(id)
  .waitForTerminal(id, { rail?, intervalMs?, timeoutMs?, onUpdate?, signal? })

root.payins
  .create({ payer_id, amount_in_cents, rail?='standard_ach', auto_approve?=true, ... })
  .get(id) / .list(params) / .approve(id) / .cancel(id)
  .waitForTerminal(id, { rail?, ... })

root.webhooks
  .create({ url, description? })  // returns secret_key (only on create)
  .list / .get / .toggle / .delete

root.sessionTokens
  .createForParty({ party_id, party_type? })

root.flows
  .payTo({ payee, amount_in_cents, rail, paymentMethod?, subaccount_id?, simulateFailure?, waitForTerminal?=true, onStatus? })
  .chargeFrom({ payer, amount_in_cents, rail?, bank?, subaccount_id?, simulateFailure?, waitForTerminal?=true, onStatus? })

root.request<T>(path, { method, body?, query?, headers?, timeoutMs?, signal? })
```

---

## Determinism contract

The SDK guarantees the following so the AI never has to "remember" them:

| Concern | Guarantee |
|---|---|
| Auth header | `X-API-KEY`, sourced from `apiKey` option or `process.env.ROOT_API_KEY`. Value must be the full token `test_<uuid>_<secret>` or `live_<uuid>_<secret>`, not a bare UUID. Never `Authorization: Bearer …`. |
| Base URL | `baseUrl` option → `process.env.ROOT_BASE_URL` → `https://api.useroot.com`. |
| Money | Always `amount_in_cents` (integers). The SDK does not accept dollars. |
| Response shape | Single objects auto-unwrap `{ data: … }`; lists keep their `{ data, has_more, next_cursor }` shape. |
| Errors | Non-2xx → throws `RootApiError` with `.status`, `.code`, `.body`, `.rawText`, and a friendly message. |
| Retries | 5xx and 429 → 1 retry with exponential backoff. Configurable via `maxRetries`. |
| Network errors | Retried up to `maxRetries` times. |
| Polling | `waitForTerminal` uses per-rail defaults: `instant_*` 1.5s × 20s, `same_day_ach` / `standard_ach` 3s × 90s, `wire` 5s × 180s. |
| Defaults | `auto_approve: true` and `currency_code: 'USD'` on payouts/payins so demos don't stall in approval queues. |
| Sandbox safety | Test bank/card/routing numbers exposed as `ALLOWED_TEST_*` constants. Random numbers will be rejected by sandbox. |
| Failure simulation | `simulateFailure: true` (or `payeeNameForTransaction`) swaps in `John Failed` — the only name that triggers a sandbox failure. |

---

## Pagination

```ts
import { paginate, collectAll } from '@useroot/sandbox-sdk'

for await (const page of paginate((p) => root.payouts.list({ ...p, status: 'failed' }))) {
  for (const payout of page.data) console.log(payout.id, payout.status)
}

const everyFailed = await collectAll((p) => root.payouts.list({ ...p, status: 'failed' }))
```

---

## Status helpers

```ts
import { isTerminal, isSuccess, statusLabel, terminalForRail } from '@useroot/sandbox-sdk'

statusLabel(payout.status)        // 'Queued' | 'Sent to bank' | 'Processing' | 'Paid' | 'Failed' | 'Canceled' | 'Under review'
isTerminal(payout.status)         // true for settled / debited / failed / canceled
isSuccess(payout.status)          // true for settled / debited
terminalForRail('standard_ach')   // 'debited'
terminalForRail('instant_bank')   // 'settled'
```

---

## Observability

Every HTTP call can be observed via the `onRequest` hook — handy for the "API timeline" panels demos like to render:

```ts
const root = new Root({
  onRequest: ({ method, path, status, durationMs }) => {
    console.log(`${method} ${path} → ${status} (${durationMs}ms)`)
  },
})
```

---

## What this SDK does NOT cover (intentionally)

- `/superuser/*` endpoints (operator/cookie auth — out of scope for demo apps).
- OAuth client bootstrap and `/api/api-tokens` (operator-provisioned).
- Treasury endpoints requiring superuser auth (`list_treasury_*`, h2h processing, send transfers).
- File-upload endpoints.

For anything not yet covered, use `root.request<T>(path, opts)` as an escape hatch.

---

## License

MIT
