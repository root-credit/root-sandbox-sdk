# Prompt — Add a Root webhook listener

Paste the block below into v0.

---

I want a server-only endpoint that receives webhook events from Root (e.g.
`payout.completed`, `payout.failed`) and updates the corresponding ledger
entry in Redis.

## Files to read first

- `AGENTS.md`
- `sdk/LLM.md` (or the mirrored `LLM-SDK.md`) for SDK webhook details
- `lib/redis.ts` (`setTransaction`, `getTransaction`)
- `app/actions/payouts.ts` (existing transaction creation flow)
- `lib/types/payments.ts` (`PayoutStatus`)

## Hard rules

- The webhook handler MUST be server-only (`app/api/webhooks/root/route.ts`).
  Never call it from the client.
- Verify the signature using a shared secret. Add `ROOT_WEBHOOK_SECRET` to
  `.env.example` with a comment explaining how to obtain it.
- Use the `Root` SDK client in `lib/root-api.ts` for any reads (e.g. fetching
  the full payout to confirm idempotency).
- DO NOT create a server action for the webhook itself; route handlers are the
  correct surface for external POSTs.

## Build

`app/api/webhooks/root/route.ts`:

1. Export `POST(request: NextRequest)`.
2. Read the raw body and the `X-Root-Signature` header. Verify HMAC against
   `process.env.ROOT_WEBHOOK_SECRET`. If invalid, return 401.
3. Parse the body as JSON. Switch on `event.type`:
   - `payout.completed` → look up the transaction by `rootPayoutId`, update its
     `status` to `PayoutStatus.Completed` via `setTransaction`. Idempotent: if
     status is already Completed, do nothing.
   - `payout.failed` → same shape, status → `PayoutStatus.Failed`.
4. Return 200 with `{ ok: true }`.

Add a small guard log line so missed event types are visible in Vercel logs.

Verify with `pnpm typecheck`.
