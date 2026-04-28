# Notes — payee onboarding

## Common mistakes

1. **Posting straight to `/api/payees`** instead of using `useCreatePayee`.
2. **String literals for `paymentMethodType`**. Use `PaymentMethodType.BankAccount`.
3. **Conflating cardholder name with full name**. They are separate fields. The
   top-level `name` is the payee's legal name; `cardholderName` is whatever's
   embossed on the card.
4. **Sending strings for `expiryMonth` / `expiryYear`**. They must be numbers.
   Use `register('expiryMonth', { valueAsNumber: true })`.
5. **Validating the routing number as 8+ digits**. ABA routing numbers are
   exactly 9 digits — `payeeBankAccountInputSchema` enforces this.

## How the contract prevents drift

- `createPayeeInputSchema` is a Zod discriminated union by `paymentMethodType`.
  An LLM-generated input with `paymentMethodType: 'card'` (typo) fails parse on
  both client and server.
- The action runs `createPayeeInputSchema.parse(input)` before any Root call —
  garbage in, ZodError out, no half-created payees.
