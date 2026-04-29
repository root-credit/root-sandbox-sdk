# Notes — payer bank-link

## Common mistakes

1. **Confusing payer funding with payee bank attachment.**
   - `attachPayerBankAccount` (in `lib/root-api`) is for the payer (funding party).
   - `attachPayeeBankAccount` is for the payee.
   - The action `linkPayerBank` calls the payer one. Don't swap them.
2. **Storing the routing number on the payer record.** Don't. We only
   persist the `bankAccountToken` returned by Root.
3. **Treating `bankAccountToken` as a bank account number.** It's an opaque
   identifier — never display it raw, and never send it back to Root as a
   routing/account number.
4. **Calling `/api/payer/bank-account` with `restaurantId`.** The field is
   `payerId`. (Caught at parse time by `linkBankInputSchema`.)

## How the contract prevents drift

- `linkBankInputSchema` enforces 9-digit routing.
- The action calls `revalidatePath('/dashboard/payer')` so re-fetching is
  automatic.
