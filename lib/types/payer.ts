/**
 * Payer domain types.
 *
 * A `Payer` is the entity that funds payouts (aligned with Root payer IDs).
 * UI labels for the active vertical (e.g. "Restaurant", "Marketplace", "Studio")
 * live in {@link import('@/lib/branding').branding}.
 *
 * v0 / LLM contract:
 *   - Use `signupPayerInputSchema` for signup forms.
 *   - Use `linkBankInputSchema` for the bank-link form.
 *   - Do NOT define ad-hoc payer schemas in component files.
 */
import { z } from 'zod';

/** Stored Payer record (mirrors the shape persisted in Redis). */
export const payerSchema = z.object({
  id: z.string().uuid(),
  payerEmail: z.string().email(),
  payerName: z.string().min(2),
  phone: z.string().min(7),
  rootPayerId: z.string(),
  bankAccountToken: z.string().optional(),
  /** Root subaccount id used for payins / payout draws when set (opaque string). */
  subaccountId: z.string().min(1).optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export type Payer = z.infer<typeof payerSchema>;

export const signupPayerInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  payerName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignupPayerInput = z.infer<typeof signupPayerInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const linkBankInputSchema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be exactly 9 digits'),
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  accountType: z.enum(['checking', 'savings']),
  /** When set, associate the pay-by-bank PM with this Root subaccount (API query). */
  subaccountId: z.string().min(1).optional(),
});

export type LinkBankInput = z.infer<typeof linkBankInputSchema>;

/** Label for a newly created Root subaccount (operator-visible). */
export const createSubaccountInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(128),
});

export type CreateSubaccountInput = z.infer<typeof createSubaccountInputSchema>;
