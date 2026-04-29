/**
 * ACH pay-in (fund subaccount) and subaccount move inputs.
 *
 * v0 / LLM contract:
 *   - Use `fundSubaccountPayinInputSchema` for ACH pulls into a subaccount.
 *   - Amount `amount` is decimal dollars (same convention as payout line items); server converts to cents.
 */
import { z } from 'zod';

/** ACH rails accepted by Root payins (matches SDK `PayinRail`). */
export const payinRailSchema = z.enum(['standard_ach', 'same_day_ach']);

export const fundSubaccountPayinInputSchema = z.object({
  /** Dollar amount from a form; converted to cents server-side. */
  amount: z.number().positive('Amount must be greater than $0.00'),
  rail: payinRailSchema,
  /** Overrides Redis payer.subaccountId when provided. */
  subaccountId: z.string().min(1).optional(),
});

export type FundSubaccountPayinInput = z.infer<typeof fundSubaccountPayinInputSchema>;

export const moveSubaccountFundsInputSchema = z.object({
  fromSubaccountId: z.string().min(1),
  toSubaccountId: z.string().min(1),
  /** Dollar amount; converted to cents for `POST /api/subaccounts/move`. */
  amount: z.number().positive('Amount must be greater than $0.00'),
});

export type MoveSubaccountFundsInput = z.infer<typeof moveSubaccountFundsInputSchema>;
