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
import {
  attachPayerBankAccount,
  createRootPayin,
  createRootSubaccount,
} from '@/lib/root-api';
import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';
import type { FundSubaccountPayinInput } from '@/lib/types/fund';
import { fundSubaccountPayinInputSchema } from '@/lib/types/fund';
import { dollarsToCents } from '@/lib/types/payments';
import {
  createSubaccountInputSchema,
  linkBankInputSchema,
  type CreateSubaccountInput,
  type LinkBankInput,
  type Payer,
} from '@/lib/types/payer';

export type LinkBankResult = {
  success: true;
  bankAccountId: string;
};

export type CreatePayerSubaccountResult = {
  success: true;
  subaccountId: string;
  name: string;
};

export type FundPayerSubaccountPayinResult = {
  success: true;
  payinId: string;
  status: string;
  rail: string;
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
  }, {
    subaccountId: parsed.subaccountId,
  });

  await setPayer(payerId, {
    ...payer,
    bankAccountToken: bankAccount.id,
    ...(parsed.subaccountId !== undefined
      ? { subaccountId: parsed.subaccountId }
      : {}),
    updatedAt: Date.now(),
  });

  revalidatePath('/dashboard/payer');

  return { success: true, bankAccountId: bankAccount.id };
}

/**
 * Create a Root subaccount and persist its id on the operator payer record.
 */
export async function createPayerSubaccount(
  payerId: string,
  input: CreateSubaccountInput
): Promise<CreatePayerSubaccountResult> {
  const parsed = createSubaccountInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }

  const payer = await getPayer(payerId);
  if (!payer) {
    throw new Error('Payer not found');
  }

  const sub = await createRootSubaccount(parsed.name);

  await setPayer(payerId, {
    ...payer,
    subaccountId: sub.id,
    updatedAt: Date.now(),
  });

  revalidatePath('/dashboard/payer');

  return { success: true, subaccountId: sub.id, name: sub.name };
}

/**
 * ACH pull from the payer's linked pay-by-bank method into a subaccount (`standard_ach` | `same_day_ach`).
 * Requires a linked bank + target subaccount (stored on payer or passed in input).
 */
export async function fundPayerSubaccountPayin(
  payerId: string,
  input: FundSubaccountPayinInput
): Promise<FundPayerSubaccountPayinResult> {
  const parsed = fundSubaccountPayinInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }

  const payer = await getPayer(payerId);
  if (!payer) {
    throw new Error('Payer not found');
  }

  if (!payer.bankAccountToken) {
    throw new Error('Link a funding bank account before creating a payin');
  }

  const subaccount_id = parsed.subaccountId ?? payer.subaccountId;
  if (!subaccount_id) {
    throw new Error(
      'Set a subaccount first (create subaccount or pass subaccountId)'
    );
  }

  const amount_in_cents = dollarsToCents(parsed.amount);
  const payin = await createRootPayin({
    payer_id: payer.rootPayerId,
    amount_in_cents,
    rail: parsed.rail,
    subaccount_id,
    auto_approve: true,
    currency_code: 'USD',
  });

  revalidatePath('/dashboard/payer');

  return {
    success: true,
    payinId: payin.id,
    status: String(payin.status),
    rail: payin.rail,
  };
}
