'use server';

/**
 * Merchant server actions.
 *
 * v0 / LLM contract:
 *   - Components MUST call these via the matching hook in `lib/hooks/*` — NEVER `fetch('/api/...')`.
 *   - Inputs are validated against Zod schemas in `lib/types/*` before any side-effect.
 */

import { revalidatePath } from 'next/cache';
import { getMerchant, setMerchant } from '@/lib/redis';
import { attachPayerBankAccount } from '@/lib/root-api';
import { getCurrentSession, sessionOwnsMerchant } from '@/lib/session';
import {
  linkBankInputSchema,
  type LinkBankInput,
  type Merchant,
} from '@/lib/types/merchant';

export type LinkBankResult = {
  success: true;
  bankAccountId: string;
};

/** Read the merchant record for the calling session. */
export async function getCurrentMerchant(): Promise<Merchant | null> {
  const session = await getCurrentSession();
  if (!session) return null;
  const merchant = (await getMerchant(session.merchantId)) as Merchant | null;
  return merchant;
}

/**
 * Link a funding bank account to the merchant via Root, then persist the bank token
 * on the Redis merchant record.
 */
export async function linkMerchantBank(
  merchantId: string,
  input: LinkBankInput
): Promise<LinkBankResult> {
  const parsed = linkBankInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsMerchant(session, merchantId)) {
    throw new Error('Unauthorized');
  }

  const merchant = await getMerchant(merchantId);
  if (!merchant) {
    throw new Error('Merchant not found');
  }

  const bankAccount = await attachPayerBankAccount(merchant.rootPayerId, {
    accountNumber: parsed.accountNumber,
    routingNumber: parsed.routingNumber,
  });

  await setMerchant(merchantId, {
    ...merchant,
    bankAccountToken: bankAccount.id,
    updatedAt: Date.now(),
  });

  revalidatePath('/dashboard/merchant');

  return { success: true, bankAccountId: bankAccount.id };
}
