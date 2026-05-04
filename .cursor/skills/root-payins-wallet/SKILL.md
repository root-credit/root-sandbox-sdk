---
name: root-payins-wallet
description: >-
  Covers inbound payins, wallet/subaccount funding via Root payins, and ledger snapshot
  reads for balances. Use when implementing fundPayerSubaccountPayin, createRootPayin,
  wallet UI, or subaccount ledger snapshots.
---

# Root payins & wallet

## When to use

Funding a payer subaccount via payin rails, wallet balance display, or payin creation for demos. Triggers: payin, wallet balance, `fundPayerSubaccountPayin`, `createRootPayin`, subaccount ledger snapshot.

## Read order

1. [`AGENTS.md`](../../../AGENTS.md) — layers and any hooks touching payer funding if listed.
2. Payin-related SDK resources under [`sdk/src/resources/`](../../../sdk/src/resources/).
3. [`lib/root-api.ts`](../../../lib/root-api.ts) — payin helpers and `getSubaccountLedgerSnapshot` (names per current file).
4. [`app/actions/payer.ts`](../../../app/actions/payer.ts) — e.g. `fundPayerSubaccountPayin` and related mutations.

## Golden path

Wallet / funding UI → hook → action in `app/actions/payer.ts` → `lib/root-api.ts` payin + ledger helpers → SDK.

## Sharp edges

- Payin rails and sandbox behaviors differ by rail — consult [`sdk/LLM.md`](../../../sdk/LLM.md) rather than hardcoding assumptions.
- Ledger snapshots are read paths; keep them on the server via actions / RSC loaders, not direct SDK from client components.
- Respect cents and `PaymentRail` enum the same as payouts.

## Do not

Expose payin simulation secrets or API keys to the client bundle.
