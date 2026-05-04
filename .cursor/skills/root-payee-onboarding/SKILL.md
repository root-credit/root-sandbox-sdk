---
name: root-payee-onboarding
description: >-
  Guides payee creation, payment method attachment (bank/card), and Redis ordering
  patterns for payees in the Root template. Use when adding payees, payment rails for
  recipients, getOrCreateRootPayee, or payee server actions.
---

# Root payee onboarding

## When to use

Creating payees, attaching banks or cards, listing payees for payout, or reconciling local Redis payees with Root. Triggers: payee onboarding, `getOrCreateRootPayee`, payment method, recipient rail.

## Read order

1. [`AGENTS.md`](../../../AGENTS.md) — `usePayees`, `useCreatePayee`, `useRemovePayee`, contract rules.
2. SDK resources under [`sdk/src/resources/`](../../../sdk/src/resources/) relevant to payees / external accounts (filenames match your SDK version).
3. [`lib/root-api.ts`](../../../lib/root-api.ts) — payee factory and rail selection helpers.
4. [`app/actions/payees.ts`](../../../app/actions/payees.ts) — mutations and Redis-before-remote ordering if present.

## Golden path

Dashboard UI → hooks under `lib/hooks/usePayees*` → `app/actions/payees.ts` → `lib/root-api.ts` → SDK payee / instrument APIs.

## Sharp edges

- Prefer extending existing `payoutRailForPayee` (or equivalent) in `root-api` when rails depend on payee state.
- Never rename domain types for a vertical; use [`lib/branding.ts`](../../../lib/branding.ts) for labels.
- If actions write Redis then call Root, preserve the repo’s ordering and idempotency patterns by following existing action code.

## Do not

Duplicate type tables from AGENTS — link to [`lib/types/payments.ts`](../../../lib/types/payments.ts) and SDK typings under `sdk/dist/` when needed.
