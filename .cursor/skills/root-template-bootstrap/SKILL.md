---
name: root-template-bootstrap
description: >-
  Orient agents to the Root payouts template monorepo before adding pages or vertical
  reskins. Covers AGENTS.md contract, branding-only reskin, contract verification, and
  where hooks/actions live. Use when onboarding to this repo, bootstrapping a feature,
  or when the user mentions Root template, vertical reskin, or verify-contract.
---

# Root template bootstrap

## When to use

Starting work in this repository, adding a new dashboard surface, or reskinning copy for a new vertical. Trigger phrases: Root template, payouts demo, `verify-contract`, vertical / branding reskin, where does Root SDK go.

## Read order

1. [`AGENTS.md`](../../../AGENTS.md) — contract SSOT, hard rules, hook/action tables.
2. [`sdk/LLM.md`](../../../sdk/LLM.md) — SDK rails, cents, polling (after the monorepo note at the top).
3. [`lib/root-api.ts`](../../../lib/root-api.ts) — server-only SDK wrappers used by actions.
4. Nearest [`app/actions/*.ts`](../../../app/actions/) module for the feature you are extending.

## Golden path

1. Confirm no client import of `lib/root-api` or `@root-credit/root-sdk`.
2. New UI reads data via [`lib/hooks`](../../../lib/hooks); mutations call [`app/actions`](../../../app/actions) from hooks or forms.
3. New Root API usage: add or extend a thin function in `lib/root-api.ts`, then call it from an action.
4. Vertical-facing copy: [`lib/branding.ts`](../../../lib/branding.ts) only — do not rename `Payer` / `Payee` / `Payout` types.

## Sharp edges

- Run `pnpm verify-contract` before merging; it encodes the layered contract from AGENTS.
- Money is integer cents (`Money`); display helpers live at the UI boundary per AGENTS.
- Do not duplicate AGENTS tables inside prompts — link paths instead.

## Optional deep dives

Domain-specific recipes: see sibling skills under `.cursor/skills/` (`root-payer-funding`, `root-payee-onboarding`, `root-payouts-ledger`, `root-payins-wallet`, `root-subaccount-moves`).
