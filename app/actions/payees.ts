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
import { RootApiError } from '@root-credit/root-sdk';
import { setPayee, getPayerPayees, getPayer, deletePayee } from '@/lib/redis';
import {
  getOrCreateRootPayee,
  attachPayeeBankAccount,
  attachPayeeDebitCard,
} from '@/lib/root-api';
import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';
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

/** List all payees that belong to the calling payer. */
export async function listPayees(payerId: string): Promise<Payee[]> {
  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }
  const payees = (await getPayerPayees(payerId)) as Payee[];
  return payees;
}

/** Create a payee in Root + persist a Redis record. Caller must own the payer. */
export async function createPayee(
  payerId: string,
  input: CreatePayeeInput
): Promise<CreatePayeeResult> {
  const parsed = createPayeeInputSchema.parse(input);

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
  const rootPayeeId = rootPayee.id;

  let paymentMethodId: string;
  try {
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
  } catch (err) {
    throw new Error(
      `Payment method could not be added (${paymentMethodFailureMessage(err)}). Your worker profile already exists remotely — update the bank or card details and try again.`,
    );
  }

  const roster = (await getPayerPayees(payerId)) as Payee[];
  const existingByRoot = roster.find((p) => p.rootPayeeId === rootPayeeId);
  const now = Date.now();

  let payeeId: string;
  if (existingByRoot) {
    payeeId = existingByRoot.id;
    await setPayee(payeeId, {
      ...existingByRoot,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      paymentMethodId,
      paymentMethodType: parsed.paymentMethodType,
      updatedAt: now,
    });
  } else {
    payeeId = randomUUID();
    await setPayee(payeeId, {
      id: payeeId,
      payerId,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      paymentMethodId,
      paymentMethodType: parsed.paymentMethodType,
      rootPayeeId,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/payees');
  revalidatePath('/dashboard/payouts');

  return { success: true, payeeId, paymentMethodId };
}

function paymentMethodFailureMessage(err: unknown): string {
  if (err instanceof RootApiError) {
    const body = err.body;
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      body.message != null
    ) {
      return String(body.message);
    }
    const raw = err.rawText?.trim();
    if (raw) return raw.slice(0, 280);
    return `HTTP ${err.status}`;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

/** Remove a payee from the calling payer's roster. */
export async function removePayee(
  payerId: string,
  input: DeletePayeeInput
): Promise<{ success: true }> {
  const parsed = deletePayeeInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }

  await deletePayee(parsed.payeeId, payerId);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/payees');
  revalidatePath('/dashboard/payouts');

  return { success: true };
}
