---
name: root-subaccount-moves
description: >-
  Marketplace-style transfers between Root subaccounts (move funds). Use when
  implementing moveRootSubaccountFunds, split payouts, marketplace settlements, or
  vertical-specific composition layers such as godaddy-actions.
---

# Root subaccount moves

## When to use

Moving balances between subaccounts, orchestrating multi-party settlements, or following a vertical-specific action layer built on top of core payout/payin flows. Triggers: subaccount move, marketplace transfer, `moveRootSubaccountFunds`, commission split.

## Read order

1. [`AGENTS.md`](../../../AGENTS.md) — contract boundaries before adding new orchestration.
2. SDK resources for accounts / subaccounts / transfers under [`sdk/src/resources/`](../../../sdk/src/resources/) (exact filenames depend on SDK version).
3. [`lib/root-api.ts`](../../../lib/root-api.ts) — locate `moveRootSubaccountFunds` and related helpers.
4. Canonical move orchestration in this template: [`app/actions/subaccounts.ts`](../../../app/actions/subaccounts.ts); compose further flows in additional `app/actions/*` modules following the same pattern.

## Golden path

New orchestration should still terminate in thin `root-api` functions plus `app/actions/*` entry points (see [`app/actions/subaccounts.ts`](../../../app/actions/subaccounts.ts) for moves); UI stays on hooks per AGENTS recipes.

## Sharp edges

- Subaccount IDs are sensitive routing data — load from env/server config patterns already in `root-api`, not from client-supplied arbitrary strings without validation.
- Sequence matters for money movement + ledger consistency — follow existing transaction recording patterns from payouts/payins before adding steps.
- Keep Redis keys and revalidation consistent with operational notes in AGENTS.

## Do not

Bypass `lib/root-api.ts` with ad hoc SDK instantiation in random modules — single server-only entry point preserves key handling.
