'use server';

/**
 * Payer server actions (funding party / operator record).
 *
 * v0 / LLM contract:
 *   - Components MUST call these via the matching hook in `lib/hooks/*` — NEVER `fetch('/api/...')`.
 *   - Inputs are validated against Zod schemas in `lib/types/*` before any side-effect.
 */

import { revalidatePath } from 'next/cache';
import { getPayer, setPayer } from '@/lib/redis';
import { attachPayerBankAccount } from '@/lib/root-api';
import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';
import {
  linkBankInputSchema,
  type LinkBankInput,
  type Payer,
} from '@/lib/types/payer';

export type LinkBankResult = {
  success: true;
  bankAccountId: string;
};

/** Read the payer record for the calling session. */
export async function getCurrentPayer(): Promise<Payer | null> {
  const session = await getCurrentSession();
  if (!session) return null;
  const payer = (await getPayer(session.payerId)) as Payer | null;
  return payer;
}

/**
 * Link a funding bank account to the payer via Root, then persist the bank token
 * on the Redis payer record.
 */
export async function linkPayerBank(
  payerId: string,
  input: LinkBankInput
): Promise<LinkBankResult> {
  const parsed = linkBankInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }

  const payer = await getPayer(payerId);
  if (!payer) {
    throw new Error('Payer not found');
  }

  const bankAccount = await attachPayerBankAccount(payer.rootPayerId, {
    accountNumber: parsed.accountNumber,
    routingNumber: parsed.routingNumber,
  });

  await setPayer(payerId, {
    ...payer,
    bankAccountToken: bankAccount.id,
    updatedAt: Date.now(),
  });

  revalidatePath('/dashboard/payer');

  return { success: true, bankAccountId: bankAccount.id };
}
