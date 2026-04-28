'use server';

/**
 * Payee server actions.
 *
 * v0 / LLM contract:
 *   - Components MUST call these via the matching hook in `lib/hooks/*` — NEVER `fetch('/api/...')`.
 *   - Inputs are validated against Zod schemas in `lib/types/*` before any side-effect.
 */

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { setPayee, getMerchantPayees, getMerchant, deletePayee } from '@/lib/redis';
import {
  createRootPayee,
  attachPayeeBankAccount,
  attachPayeeDebitCard,
} from '@/lib/root-api';
import { getCurrentSession, sessionOwnsMerchant } from '@/lib/session';
import {
  createPayeeInputSchema,
  deletePayeeInputSchema,
  type CreatePayeeInput,
  type DeletePayeeInput,
  type Payee,
} from '@/lib/types/payee';
import { PaymentMethodType } from '@/lib/types/payments';

export type CreatePayeeResult = {
  success: true;
  payeeId: string;
  paymentMethodId: string;
};

/** List all payees that belong to the calling merchant. */
export async function listPayees(merchantId: string): Promise<Payee[]> {
  const session = await getCurrentSession();
  if (!sessionOwnsMerchant(session, merchantId)) {
    throw new Error('Unauthorized');
  }
  const payees = (await getMerchantPayees(merchantId)) as Payee[];
  return payees;
}

/** Create a payee in Root + persist a Redis record. Caller must own the merchant. */
export async function createPayee(
  merchantId: string,
  input: CreatePayeeInput
): Promise<CreatePayeeResult> {
  const parsed = createPayeeInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsMerchant(session, merchantId)) {
    throw new Error('Unauthorized');
  }

  const merchant = await getMerchant(merchantId);
  if (!merchant) {
    throw new Error('Merchant not found');
  }

  const rootPayee = await createRootPayee({
    email: parsed.email,
    name: parsed.name,
    phone: parsed.phone,
  });
  const rootPayeeId = rootPayee.id;

  let paymentMethodId: string;

  if (parsed.paymentMethodType === PaymentMethodType.BankAccount) {
    const bankResult = await attachPayeeBankAccount(rootPayeeId, {
      accountNumber: parsed.accountNumber,
      routingNumber: parsed.routingNumber,
    });
    paymentMethodId = bankResult.id || rootPayeeId;
  } else {
    const cardResult = await attachPayeeDebitCard(rootPayeeId, {
      cardNumber: parsed.cardNumber,
      expiryMonth: parsed.expiryMonth,
      expiryYear: parsed.expiryYear,
    });
    paymentMethodId = cardResult.id || rootPayeeId;
  }

  const payeeId = randomUUID();
  await setPayee(payeeId, {
    id: payeeId,
    merchantId,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    paymentMethodId,
    paymentMethodType: parsed.paymentMethodType,
    rootPayeeId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  revalidatePath('/dashboard/payees');
  revalidatePath('/dashboard/payouts');

  return { success: true, payeeId, paymentMethodId };
}

/** Remove a payee from the calling merchant's roster. */
export async function removePayee(
  merchantId: string,
  input: DeletePayeeInput
): Promise<{ success: true }> {
  const parsed = deletePayeeInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsMerchant(session, merchantId)) {
    throw new Error('Unauthorized');
  }

  await deletePayee(parsed.payeeId, merchantId);

  revalidatePath('/dashboard/payees');
  revalidatePath('/dashboard/payouts');

  return { success: true };
}
