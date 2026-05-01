'use server';

/**
 * Gusto wallet — server actions for the live Gusto wallet (subaccount) balance.
 *
 * Why this lives here (and not under `app/actions/*`):
 *   - The protected-paths rule keeps `app/actions/*`, `lib/hooks/*`, `lib/types/*`,
 *     `app/api/*`, and `lib/redis*.ts` off-limits. Next.js allows server actions
 *     in any module that starts with `'use server'`, so the live-balance helpers
 *     for the Gusto wallet live in `lib/wallet-actions.ts` and import the existing
 *     server-only modules read-only.
 *
 * Cache policy:
 *   - Nothing here is cached. The wallet balance is fetched live from Root on
 *     every call; we never persist a derived balance client-side.
 */

import { getPayer } from '@/lib/redis';
import { getSubaccountLedgerSnapshot } from '@/lib/root-api';
import { getCurrentSession } from '@/lib/session';
import type { Money } from '@/lib/types/payments';

/**
 * Live Gusto wallet balance via {@link getSubaccountLedgerSnapshot}
 * (`total_incoming_cents` / `total_outgoing_cents`). Not cached. Returns
 * `enabled: false` when no subaccount has been provisioned yet.
 */
export type WalletStatus = {
  enabled: boolean;
  subaccountId: string | null;
  balanceCents: Money | null;
  incomingCents: Money | null;
  outgoingCents: Money | null;
};

const EMPTY: WalletStatus = {
  enabled: false,
  subaccountId: null,
  balanceCents: null,
  incomingCents: null,
  outgoingCents: null,
};

export async function getMyWalletStatus(): Promise<WalletStatus> {
  const session = await getCurrentSession();
  if (!session) return EMPTY;

  const payer = await getPayer(session.payerId);
  if (!payer?.subaccountId) return EMPTY;

  try {
    const snap = await getSubaccountLedgerSnapshot(payer.subaccountId);
    return {
      enabled: true,
      subaccountId: payer.subaccountId,
      balanceCents: snap.balanceCents,
      incomingCents: snap.totalIncomingCents,
      outgoingCents: snap.totalOutgoingCents,
    };
  } catch {
    return {
      enabled: true,
      subaccountId: payer.subaccountId,
      balanceCents: null,
      incomingCents: null,
      outgoingCents: null,
    };
  }
}
