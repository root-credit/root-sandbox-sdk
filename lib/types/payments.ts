/**
 * Cross-cutting payments primitives shared by every contract type.
 *
 * v0 / LLM contract:
 *   - Use `PaymentRail` whenever a rail is referenced in UI (never hardcode strings).
 *   - All amounts are integer cents (`Money`); never represent money in dollars.
 *   - To reskin to dollars in UI only, use `formatMoney`. Never multiply/divide
 *     by 100 inline; round-trip through `dollarsToCents` / `centsToDollars`.
 */
import { z } from 'zod';

/** Rails Root currently exposes for both pay-in (merchant funding) and pay-out. */
export const PaymentRail = {
  InstantBank: 'instant_bank',
  InstantCard: 'instant_card',
  SameDayAch: 'same_day_ach',
  StandardAch: 'standard_ach',
  Wire: 'wire',
} as const;

export type PaymentRail = (typeof PaymentRail)[keyof typeof PaymentRail];

export const paymentRailSchema = z.enum([
  PaymentRail.InstantBank,
  PaymentRail.InstantCard,
  PaymentRail.SameDayAch,
  PaymentRail.StandardAch,
  PaymentRail.Wire,
]);

/** Payout outcome — superset of the statuses Root returns + UI-friendly aliases. */
export const PayoutStatus = {
  Pending: 'pending',
  Completed: 'completed',
  Success: 'success',
  Failed: 'failed',
} as const;

export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

export const payoutStatusSchema = z.enum([
  PayoutStatus.Pending,
  PayoutStatus.Completed,
  PayoutStatus.Success,
  PayoutStatus.Failed,
]);

/** Payment method type a payee uses to receive funds. */
export const PaymentMethodType = {
  BankAccount: 'bank_account',
  DebitCard: 'debit_card',
} as const;

export type PaymentMethodType =
  (typeof PaymentMethodType)[keyof typeof PaymentMethodType];

export const paymentMethodTypeSchema = z.enum([
  PaymentMethodType.BankAccount,
  PaymentMethodType.DebitCard,
]);

/**
 * Money is always stored and transmitted in integer cents to prevent IEEE
 * floating-point loss. Convert to dollars only at the display boundary.
 */
export type Money = number;

export const moneyCentsSchema = z
  .number()
  .int('Amount must be an integer number of cents')
  .nonnegative('Amount cannot be negative');

/** Convert a decimal-dollar input from a form to integer cents (rounds half-up). */
export function dollarsToCents(dollars: number): Money {
  if (!Number.isFinite(dollars)) return 0;
  return Math.round(dollars * 100);
}

/** Convert integer cents to a decimal-dollar number for display. */
export function centsToDollars(cents: Money): number {
  return cents / 100;
}

/** Format integer cents for UI ("$1,234.56"). */
export function formatMoney(
  cents: Money,
  options: { currency?: string; locale?: string } = {}
): string {
  const currency = options.currency ?? 'USD';
  const locale = options.locale ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
