/**
 * Payout domain types.
 *
 * A `Payout` represents a single transfer of money from a payer's funded balance to
 * a payee. Multiple payouts can be batched together into one server action call
 * via `ProcessPayoutInput.lineItems`.
 *
 * v0 / LLM contract:
 *   - Always send `lineItems` with `payeeId` and `amount` (dollars from the form).
 *   - The server action converts dollars → cents; never multiply by 100 in the UI.
 *   - Use `payoutStatusSchema` / `PayoutStatus` to render status pills.
 */
import { z } from 'zod';
import {
  moneyCentsSchema,
  paymentRailSchema,
  payoutStatusSchema,
  type Money,
  type PaymentRail,
  type PayoutStatus,
} from './payments';

/** A single line item inside a payout batch. UI submits `amount` in dollars. */
export const payoutLineItemSchema = z.object({
  payeeId: z.string().uuid(),
  amount: z.number().min(0.01, 'Amount must be greater than $0.00'),
});

export type PayoutLineItem = z.infer<typeof payoutLineItemSchema>;

/** Body shape for `processPayout` server action / POST /api/payouts. */
export const processPayoutInputSchema = z.object({
  payerId: z.string().uuid(),
  totalAmount: z.number().nonnegative(),
  lineItems: z
    .array(payoutLineItemSchema)
    .min(1, 'At least one line item is required'),
});

export type ProcessPayoutInput = z.infer<typeof processPayoutInputSchema>;

/** Per-line outcome the server action returns. */
export const payoutLineResultSchema = z.object({
  payeeId: z.string(),
  payeeName: z.string().optional(),
  amount: z.number(),
  status: z.enum(['success', 'failed']),
  rail: paymentRailSchema.optional(),
  payoutId: z.string().optional(),
  transactionId: z.string().optional(),
  error: z.string().optional(),
});

export type PayoutLineResult = z.infer<typeof payoutLineResultSchema>;

export const processPayoutResultSchema = z.object({
  success: z.boolean(),
  totalAmount: z.number(),
  payoutCount: z.number(),
  results: z.array(payoutLineResultSchema),
  transactionIds: z.array(z.string()),
});

export type ProcessPayoutResult = z.infer<typeof processPayoutResultSchema>;

/** Stored transaction record (mirrors what `lib/redis.setTransaction` persists). */
export const transactionSchema = z.object({
  id: z.string().uuid(),
  payerId: z.string().uuid(),
  payeeId: z.string().uuid(),
  payeeName: z.string(),
  payeeEmail: z.string().email(),
  amountCents: moneyCentsSchema,
  amount: z.number(),
  status: z.string(),
  rootPayoutId: z.string(),
  rootTransactionId: z.string(),
  createdAt: z.number().int(),
  completedAt: z.number().int(),
});

export type Transaction = z.infer<typeof transactionSchema>;

/** Re-export for convenient single-import in pages/hooks. */
export type { Money, PaymentRail, PayoutStatus };
