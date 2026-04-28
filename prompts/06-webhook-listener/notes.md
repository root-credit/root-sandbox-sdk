# Notes — Root webhook listener

## Common mistakes

1. **Forgetting signature verification.** Without HMAC the endpoint is open to
   anyone on the internet. Always verify before doing any work.
2. **Using `request.json()` before reading the raw body for HMAC.** Read the
   body as text first, then parse. Otherwise the signature can't be reproduced.
3. **Mutating Redis through `fetch('/api/payouts', PATCH)`.** Don't. The webhook
   route has direct access to the same `setTransaction` helper that the action
   uses.
4. **Treating webhook delivery as exactly-once.** It's at-least-once. The
   handler must be idempotent: if the transaction is already in the target
   status, return early.
5. **Using string literals for status.** Reach for `PayoutStatus.Completed` /
   `PayoutStatus.Failed`.

## How the contract prevents drift

- `lib/types/payments.ts` defines the canonical statuses. Any drift triggers a
  TS compile error.
- The route handler is the only sanctioned external surface — server actions
  can't be called from third-party POSTs.
