---
name: root-payer-funding
description: >-
  Wires payer onboarding, bank linking, and payer-side funding flows using Root payers
  and subaccounts. Use when attaching pay-by-bank, funding a payer subaccount, payer
  settings, or implementing attachPayerBankAccount / PayByBank patterns.
---

# Root payer & funding

## When to use

Payer profile, attach bank / Pay by Bank, subaccount query params, or funding the payer side before payouts. Triggers: payer bank, `attachPayByBank`, subaccount id, funder, link bank flow.

## Read order

1. [`AGENTS.md`](../../../AGENTS.md) — especially hooks `usePayer`, `useLinkBank` and types.
2. SDK resource (types only; no pasting): [`sdk/src/resources/payers.ts`](../../../sdk/src/resources/payers.ts) (or adjacent resources your SDK version exposes).
3. [`lib/root-api.ts`](../../../lib/root-api.ts) — search for payer / attach / subaccount helpers (e.g. `attachPayerBankAccount`, subaccount snapshot helpers).
4. [`app/actions/payer.ts`](../../../app/actions/payer.ts) — server mutations and revalidation.

## Golden path

Client hook (e.g. `useLinkBank` / `usePayer`) → server action in `app/actions/payer.ts` → wrapper in `lib/root-api.ts` → SDK payer/subaccount methods. Never call Root from `'use client'` files.

## Sharp edges

- Amounts in cents; rails from `PaymentRail` enum in `lib/types/payments.ts`, not string literals.
- `ROOT_API_KEY` stays server-only; lazy init in `root-api` may affect build-time imports — keep SDK usage behind server boundaries per AGENTS.
- Subaccount routing: follow existing query/header patterns already used in `root-api` and actions — read implementations rather than duplicating API docs here.

## Do not

Paste large excerpts from the SDK — use [`sdk/LLM.md`](../../../sdk/LLM.md) and source files linked above.
