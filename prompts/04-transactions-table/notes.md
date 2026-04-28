# Notes — transactions table

## Common mistakes

1. **Reading `transaction.amount` (dollars) instead of `transaction.amountCents`.**
   Both fields exist on the persisted record for legacy reasons, but
   `amountCents` is the source of truth. Stick to it for arithmetic and pass it
   to `formatMoney`.
2. **Inventing status values.** The pill renderer must only know about the
   status strings present in `PayoutStatus`. Treat anything else as
   `unknown` / neutral.
3. **Sorting in the component.** `getMerchantTransactions` already sorts newest
   first; don't double-sort or reverse the array.
4. **Adding a search across all merchants.** Transactions are scoped to the
   calling merchant via `sessionOwnsMerchant`. There is no "search all" by
   design.

## How the contract prevents drift

- `transactionSchema` validates persisted shape; renaming fields will break
  schema parse on read.
- `formatMoney(cents)` is the only correct way to render currency.
