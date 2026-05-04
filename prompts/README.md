# Prompts library

Canonical, paste-ready prompts for any LLM to generate the most common
features against this template. Each numbered directory has:

- **`PROMPT.md`** — paste this into v0 (or your editor's chat). It includes the
  exact files the model should read first and the contract rules it must obey.
- **`reference/`** — the canonical files the prompt should produce, fully working
  against the contract layer in `lib/types`, `app/actions`, and `lib/hooks`. Use
  these as gold-standard outputs for evals.
- **`notes.md`** — the 3–5 mistakes the LLM commonly makes when answering this
  prompt and how the contract layer catches each one.

## Available prompts

| # | Title | Folder |
| --- | --- | --- |
| 00 | Launch a new vertical from scratch | [`00-launch/`](00-launch) |
| 01 | Build a payouts screen | [`01-payouts-screen/`](01-payouts-screen) |
| 02 | Build a payee onboarding form | [`02-payee-onboarding/`](02-payee-onboarding) |
| 03 | Build a payer bank-link screen | [`03-payer-bank-link/`](03-payer-bank-link) |
| 04 | Build a transactions table | [`04-transactions-table/`](04-transactions-table) |
| 05 | Reskin the vertical | [`05-reskin-vertical/`](05-reskin-vertical) |
| 06 | Add a Root webhook listener | [`06-webhook-listener/`](06-webhook-listener) |

## Conventions

- **Hard rules** in every prompt mirror `AGENTS.md`.
- **Money** is always integer cents. UI may submit dollars but server actions and
  storage are cents.
- **Vertical labels** come from `lib/branding.ts` only.
- **Routes**: `/dashboard/<feature>`. Add the link to `components/DashboardHeader.tsx`.

If a prompt seems missing, copy the closest one and adapt — the contract is the
same regardless of feature.
