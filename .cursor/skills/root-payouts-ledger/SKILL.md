---
name: root-payouts-ledger
description: >-
  Covers payout creation, optional subaccount selection, transaction hydration, and
  ledger-style reads in the template. Use when implementing processPayout, payouts
  dashboard, transaction history, or createPayout flows.
---

# Root payouts & ledger

## When to use

Sending payouts, showing transaction history, mapping payout status to UI, or passing `subaccount_id` on payout creation. Triggers: `createPayout`, `processPayout`, ledger, transactions table, payout status.

## Read order

1. [`AGENTS.md`](../../../AGENTS.md) — `useTransactions`, `useProcessPayout`, payout types.
2. Payout-related SDK resource(s) under [`sdk/src/resources/`](../../../sdk/src/resources/).
3. [`lib/root-api.ts`](../../../lib/root-api.ts) — payout helpers and rail helpers used by actions.
4. [`app/actions/payouts.ts`](../../../app/actions/payouts.ts) (and related transaction actions if split).

## Golden path

Payout form → `useProcessPayout` → server action → `lib/root-api.ts` → SDK payout create / retrieve → persist transaction row per existing hydration pattern → `revalidatePath` on segments listed in AGENTS operational notes.

## Sharp edges

- Terminal payout states and polling: see [`sdk/LLM.md`](../../../sdk/LLM.md) for SDK-level guidance; mirror template patterns in hooks rather than inventing new polling from the client with raw fetch.
- Money always as cents end-to-end until formatting for display.
- Optional `subaccount_id` must match how `root-api` and env defaults already combine — read current helpers before adding parameters.

## Do not

Implement `/api` fetch from components for payouts — contract forbids it; use hooks + actions.
