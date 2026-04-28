# Reference implementation — payouts screen

The canonical files this prompt should produce already exist in the template:

- [`app/dashboard/payouts/page.tsx`](../../../app/dashboard/payouts/page.tsx) —
  the page itself.
- [`components/PayoutForm.tsx`](../../../components/PayoutForm.tsx) — the form
  component (extracted so the page stays declarative).
- [`lib/hooks/useProcessPayout.ts`](../../../lib/hooks/useProcessPayout.ts) —
  the hook the form calls.
- [`app/actions/payouts.ts`](../../../app/actions/payouts.ts) — the server action
  the hook wraps.
- [`lib/types/payout.ts`](../../../lib/types/payout.ts) — the schema both sides
  validate against.

Use these as the gold-standard output. Any v0 generation that diverges from this
shape (e.g. inlining `fetch('/api/payouts')`) is wrong.
