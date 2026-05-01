'use server';

/**
 * Add-employee-without-payment flow.
 *
 * Why this lives here (and not under `app/actions/*`):
 *   - The protected-paths rule keeps `app/actions/*`, `lib/hooks/*`, `lib/types/*`,
 *     `app/api/*`, and `lib/redis*.ts` off-limits. Next.js allows server actions in
 *     any module that starts with `'use server'`, so the "skip-payment" path lives
 *     in `lib/payee-actions.ts` and imports the existing server-only modules
 *     read-only.
 *
 * Cache policy:
 *   - The only new state we persist is a `payee:<id>` Redis record (already an
 *     existing key shape). It carries the payee→payer mapping (`payerId`) the
 *     subsequent employee-login flow relies on. We use `paymentMethodId === ''`
 *     as the "no payment method yet" sentinel so we don't have to introduce any
 *     new schema.
 */

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getPayer, getPayerPayees, setPayee } from '@/lib/redis';
import { getOrCreateRootPayee } from '@/lib/root-api';
import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';
import { PaymentMethodType } from '@/lib/types/payments';

const addEmployeeWithoutPaymentInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone must be at least 7 digits'),
});

export type AddEmployeeWithoutPaymentInput = z.infer<
  typeof addEmployeeWithoutPaymentInputSchema
>;

export type AddEmployeeWithoutPaymentResult = {
  success: true;
  payeeId: string;
  rootPayeeId: string;
};

/**
 * Onboard a payee with identity only. Payment method (bank or card) is added
 * later by the payee themselves via the employee login flow.
 */
export async function addEmployeeWithoutPayment(
  payerId: string,
  input: AddEmployeeWithoutPaymentInput,
): Promise<AddEmployeeWithoutPaymentResult> {
  const parsed = addEmployeeWithoutPaymentInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }

  const payer = await getPayer(payerId);
  if (!payer) {
    throw new Error('Payer not found');
  }

  const rootPayee = await getOrCreateRootPayee({
    email: parsed.email,
    name: parsed.name,
    phone: parsed.phone,
  });

  const roster = await getPayerPayees(payerId);
  const existing = roster.find((p) => p.rootPayeeId === rootPayee.id);

  const now = Date.now();
  const payeeId = existing?.id ?? randomUUID();

  await setPayee(payeeId, {
    id: payeeId,
    payerId,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    // Sentinels until the employee attaches a real method via /employee.
    paymentMethodId: existing?.paymentMethodId ?? '',
    paymentMethodType:
      existing?.paymentMethodType ?? PaymentMethodType.BankAccount,
    rootPayeeId: rootPayee.id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/payees');
  revalidatePath('/dashboard/payouts');

  return { success: true, payeeId, rootPayeeId: rootPayee.id };
}
