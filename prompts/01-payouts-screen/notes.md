# Notes — payouts screen

## Mistakes the LLM commonly makes

1. **Calling `fetch('/api/payouts')` instead of `useProcessPayout`.**
   - Caught by `pnpm verify-contract` (regex on `fetch('/api/`).
   - Also caught by `.cursor/rules/payments.mdc`.

2. **Sending money in cents from the form, not dollars.**
   - The `processPayoutInputSchema.lineItems[].amount` is dollars (decimal).
   - The server action calls `dollarsToCents` before talking to Root.
   - If the LLM pre-multiplies in the UI, totals will be 100× off.

3. **Not filtering out `amount === 0` rows before submit.**
   - `payoutLineItemSchema` has `min(0.01)` so a 0 row will throw.
   - The reference always filters before submit.

4. **Hardcoding "tip" in headlines.**
   - Use `branding.payoutNoun` / `branding.payoutNounPlural`.

5. **Forgetting to handle per-line failures.**
   - `result.results` is an array. Some entries may have
     `status: 'failed'` while others succeed (Root rate-limited, payee
     payment method invalid, etc.). Render the result list, not just a
     blanket success/failure toast.

## How the contract prevents drift

- `processPayoutInputSchema` is parsed in the action; bad shapes throw before any
  Root call.
- `useProcessPayout` returns `{ isProcessing, error, lastResult }` so v0 always
  gets the same state machine for the submit button.
- `formatMoney(cents)` is the only sanctioned way to render currency; the UI never
  calls `.toLocaleString()` itself.
