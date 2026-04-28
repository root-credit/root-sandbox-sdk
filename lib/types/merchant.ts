/**
 * Merchant domain types.
 *
 * A `Merchant` is the entity that funds payouts. UI labels for the active vertical
 * (e.g. "Restaurant", "Marketplace", "Studio") live in {@link import('@/lib/branding').branding}.
 *
 * v0 / LLM contract:
 *   - Use `signupMerchantInputSchema` for signup forms.
 *   - Use `linkBankInputSchema` for the bank-link form.
 *   - Do NOT define ad-hoc merchant schemas in component files.
 */
import { z } from 'zod';

/** Stored Merchant record (mirrors the shape persisted in Redis). */
export const merchantSchema = z.object({
  id: z.string().uuid(),
  merchantEmail: z.string().email(),
  merchantName: z.string().min(2),
  phone: z.string().min(7),
  rootPayerId: z.string(),
  bankAccountToken: z.string().optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export type Merchant = z.infer<typeof merchantSchema>;

export const signupMerchantInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  merchantName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignupMerchantInput = z.infer<typeof signupMerchantInputSchema>;

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
});

export type LinkBankInput = z.infer<typeof linkBankInputSchema>;
