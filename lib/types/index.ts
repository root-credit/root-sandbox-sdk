/**
 * Single re-export entry-point for the contract layer.
 *
 * v0 / LLM contract:
 *   import { Payee, ProcessPayoutInput, formatMoney, PaymentRail } from '@/lib/types';
 *
 * Adding new types:
 *   1. Add the file under `lib/types/<entity>.ts` with Zod schemas + inferred TS types.
 *   2. Re-export from this barrel file.
 *   3. Reference the new schema in the corresponding server action in `app/actions/`.
 */
export * from './payments';
export * from './payee';
export * from './payout';
export * from './payer';
