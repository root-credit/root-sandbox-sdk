'use server';

/**
 * Subaccount moves — backed by Root `POST /api/subaccounts/move`.
 *
 * v0 / LLM contract:
 *   - Call via a hook when UI exists; never `fetch('/api/...')` from components.
 */

import { moveRootSubaccountFunds } from '@/lib/root-api';
import {
  moveSubaccountFundsInputSchema,
  type MoveSubaccountFundsInput,
} from '@/lib/types/fund';
import { dollarsToCents } from '@/lib/types/payments';
import { getCurrentSession, sessionOwnsPayer } from '@/lib/session';

export type MoveSubaccountFundsResult = {
  success: true;
  moveId: string;
};

/**
 * Move funds between two Root subaccounts (instant).
 * Auth: caller must own `payerId` (session-bound operator).
 */
export async function movePayerSubaccounts(
  payerId: string,
  input: MoveSubaccountFundsInput
): Promise<MoveSubaccountFundsResult> {
  const parsed = moveSubaccountFundsInputSchema.parse(input);

  const session = await getCurrentSession();
  if (!sessionOwnsPayer(session, payerId)) {
    throw new Error('Unauthorized');
  }

  const amount_in_cents = dollarsToCents(parsed.amount);
  const move = await moveRootSubaccountFunds({
    from_subaccount_id: parsed.fromSubaccountId,
    to_subaccount_id: parsed.toSubaccountId,
    amount_in_cents,
  });

  return { success: true, moveId: move.id };
}
