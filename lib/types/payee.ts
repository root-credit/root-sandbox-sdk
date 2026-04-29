/**
 * Payee domain types.
 *
 * A `Payee` is the entity that receives funds. UI labels for the active vertical
 * (e.g. "Worker", "Driver", "Freelancer") live in {@link import('@/lib/branding').branding}.
 *
 * v0 / LLM contract:
 *   - For payee creation forms, import `createPayeeInputSchema` from this file.
 *   - Do NOT define ad-hoc payee schemas in component files.
 */
import { z } from 'zod';
import {
  PaymentMethodType,
  paymentMethodTypeSchema,
} from './payments';

/** Stored Payee record (mirrors the shape persisted in Redis). */
export const payeeSchema = z.object({
  id: z.string().uuid(),
  payerId: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  paymentMethodId: z.string(),
  paymentMethodType: paymentMethodTypeSchema,
  rootPayeeId: z.string(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export type Payee = z.infer<typeof payeeSchema>;

/** Bank account payment method. */
export const payeeBankAccountInputSchema = z.object({
  paymentMethodType: z.literal(PaymentMethodType.BankAccount),
  accountNumber: z
    .string()
    .min(8, 'Account number must be at least 8 digits')
    .max(17, 'Account number is too long'),
  routingNumber: z
    .string()
    .regex(/^\d{9}$/, 'Routing number must be exactly 9 digits'),
  accountType: z.enum(['checking', 'savings']).optional(),
});

/** Debit card payment method. */
export const payeeDebitCardInputSchema = z.object({
  paymentMethodType: z.literal(PaymentMethodType.DebitCard),
  cardNumber: z
    .string()
    .min(13, 'Card number is too short')
    .max(19, 'Card number is too long'),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(new Date().getFullYear()),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits').optional(),
  cardholderName: z.string().min(2).optional(),
});

/**
 * Discriminated union for the create-payee input. Forms should `safeParse` against this;
 * the discriminant is `paymentMethodType` so React Hook Form `register` integration is clean.
 */
export const createPayeeInputSchema = z.intersection(
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
  }),
  z.discriminatedUnion('paymentMethodType', [
    payeeBankAccountInputSchema,
    payeeDebitCardInputSchema,
  ])
);

export type CreatePayeeInput = z.infer<typeof createPayeeInputSchema>;

export const deletePayeeInputSchema = z.object({
  payeeId: z.string().uuid(),
});

export type DeletePayeeInput = z.infer<typeof deletePayeeInputSchema>;
