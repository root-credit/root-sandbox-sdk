# Notes — merchant bank-link

## Common mistakes

1. **Confusing payer (merchant funding) with payee bank attachment.**
   - `attachPayerBankAccount` (in `lib/root-api`) is for the merchant.
   - `attachPayeeBankAccount` is for the payee.
   - The action `linkMerchantBank` calls the *payer* one. Don't swap them.
2. **Storing the routing number on the merchant record.** Don't. We only
   persist the `bankAccountToken` returned by Root.
3. **Treating `bankAccountToken` as a bank account number.** It's an opaque
   identifier — never display it raw, and never send it back to Root as a
   routing/account number.
4. **Calling `/api/merchant/bank-account` with `restaurantId`.** The field is
   `merchantId`. (Caught at parse time by `linkBankInputSchema`.)

## How the contract prevents drift

- `linkBankInputSchema` enforces 9-digit routing.
- The action calls `revalidatePath('/dashboard/merchant')` so re-fetching is
  automatic.
