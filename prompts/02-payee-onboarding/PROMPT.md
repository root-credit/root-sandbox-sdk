# Prompt — Build a payee onboarding form

Paste the block below into v0.

---

I want a screen that lets the operator add a new {branding.payeeSingular} with
either a bank account or a debit card as the payout rail. Use the existing
contract layer.

## Files to read first

- `AGENTS.md`
- `lib/branding.ts`
- `lib/types/payee.ts`
- `lib/types/payments.ts`
- `lib/hooks/useCreatePayee.ts`
- `components/PayeeForm.tsx` (existing reference)
- `app/dashboard/payees/page.tsx` (existing reference)

## Hard rules

- NEVER call `fetch('/api/...')`.
- Use `useCreatePayee()` for the mutation; `useSession()` for the payer id.
- Use `PaymentMethodType.BankAccount` / `PaymentMethodType.DebitCard` from
  `lib/types/payments` — NEVER hardcode the strings.
- Use `branding.payeeSingular` everywhere a label would say "Worker" / "Driver".
- The form must conditionally show bank fields OR card fields based on the
  selected `paymentMethodType`.

## Build

Create a form component (or add a route at `app/dashboard/<feature>/page.tsx`) that:

1. Uses `react-hook-form` + `@hookform/resolvers/zod`.
2. Top-level fields: `name`, `email`, `phone`, `paymentMethodType` (radio with
   two cards).
3. If `paymentMethodType === PaymentMethodType.BankAccount`: render
   `routingNumber` (9 digits, monospace), `accountNumber` (password input,
   monospace), `accountType` (`checking` | `savings`).
4. If `paymentMethodType === PaymentMethodType.DebitCard`: render
   `cardholderName`, `cardNumber`, `expiryMonth`, `expiryYear`, `cvv`.
5. On submit, call `createPayee(payerId, input)` and show success/error.

The reference uses a discriminated union internally — copy that pattern. If the
LLM tries to hand-roll a flat object with optional fields and runtime branching,
that's fine for the form, but the input passed to `createPayee` must match
`CreatePayeeInput` shape (a discriminated union by `paymentMethodType`).

Verify with `pnpm typecheck`.
