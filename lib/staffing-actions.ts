'use server';

/**
 * Dental Dynamics reskin — server actions for the temp-staff shifts marketplace
 * and the live wallet balance.
 *
 * Why this lives here (and not under `app/actions/*`):
 *   - The protected-paths rule keeps `app/actions/*`, `lib/hooks/*`, `lib/types/*`,
 *     `app/api/*`, and `lib/redis*.ts` off-limits. Next.js allows server actions
 *     in any module that starts with `'use server'`, so the new shift marketplace
 *     actions live here and import the existing Redis client read-only.
 *
 * Cache policy:
 *   - Nothing here is cached. The wallet balance is fetched live from Root on
 *     every call; the marketplace and posted-shifts lists are read directly
 *     from Redis with no SWR/Next cache wrapping.
 *   - Shift inventory is *not* bootstrapped — every shift in Redis was put
 *     there by an actual user posting it.
 */

import { randomUUID } from 'crypto';
import { redis, getPayer } from '@/lib/redis';
import {
  getSubaccountLedgerSnapshot,
  moveRootSubaccountFunds,
} from '@/lib/root-api';
import { getCurrentSession } from '@/lib/session';
import { formatMoney, type Money } from '@/lib/types/payments';

export type ServiceStatus = 'available' | 'booked';

export type ServiceListingRecord = {
  id: string;
  role: string;
  shiftDate: string; // YYYY-MM-DD
  hours: number;
  hourlyRateCents: Money;
  totalCents: Money;
  location: string;
  ownerId: string;
  ownerHandle: string;
  postedAt: string; // ISO
  status: ServiceStatus;
  bookedBy?: string;
  bookedByHandle?: string;
  bookedAt?: string;
};

export type ServiceMutationResult =
  | { ok: true }
  | { ok: false; reason: string };

type ServiceMeta = ServiceListingRecord;

const META_KEY = (id: string) => `dental:shift:${id}`;
const POSTED_KEY = (payerId: string) => `dental:posted:${payerId}`;
const AVAILABLE_KEY = 'dental:available';

const ROLE_OPTIONS = new Set([
  'Dental Hygienist',
  'Dental Assistant',
  'Front Desk',
  'Office Manager',
  'Sterilization Tech',
  'Treatment Coordinator',
]);

function parseStoredJson<T>(data: unknown): T | null {
  if (data == null) return null;
  if (typeof data === 'object') return data as T;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }
  return null;
}

async function readMeta(id: string): Promise<ServiceMeta | null> {
  const raw = await redis.get(META_KEY(id));
  return parseStoredJson<ServiceMeta>(raw);
}

async function writeMeta(meta: ServiceMeta): Promise<void> {
  await redis.set(META_KEY(meta.id), JSON.stringify(meta));
}

function handleFor(payer: { payerName?: string; payerEmail: string } | null): string {
  if (!payer) return '@member';
  const local = payer.payerEmail.split('@')[0] ?? 'member';
  return `@${local}`;
}

/** Posted shifts for the signed-in member (available + booked). Live; no caching. */
export async function getMyPostedServices(): Promise<ServiceListingRecord[]> {
  const session = await getCurrentSession();
  if (!session) return [];
  const ids = (await redis.smembers(POSTED_KEY(session.payerId))) ?? [];
  if (ids.length === 0) return [];
  const metas = await Promise.all(ids.map((id) => readMeta(id)));
  return metas
    .filter(
      (m): m is ServiceMeta => Boolean(m) && m!.ownerId === session.payerId,
    )
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

/** All available shifts posted by other members (excluding the caller's own). Live. */
export async function getAvailableServices(): Promise<ServiceListingRecord[]> {
  const session = await getCurrentSession();
  const myId = session?.payerId;
  const ids = (await redis.smembers(AVAILABLE_KEY)) ?? [];
  if (ids.length === 0) return [];
  const metas = await Promise.all(ids.map((id) => readMeta(id)));
  const records: ServiceListingRecord[] = [];
  for (const m of metas) {
    if (!m || m.status !== 'available') continue;
    if (myId && m.ownerId === myId) continue;
    records.push(m);
  }
  return records.sort((a, b) => a.shiftDate.localeCompare(b.shiftDate));
}

export type PostServiceInput = {
  role: string;
  shiftDate: string;
  hours: number;
  hourlyRateCents: Money;
  location: string;
};

/** Post a temporary shift to the marketplace. */
export async function postService(
  input: PostServiceInput,
): Promise<ServiceMutationResult & { service?: ServiceListingRecord }> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const role = input.role.trim();
  if (!ROLE_OPTIONS.has(role)) {
    return { ok: false, reason: 'Pick a role from the dropdown.' };
  }
  if (
    !input.shiftDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.shiftDate) ||
    Number.isNaN(new Date(input.shiftDate).getTime())
  ) {
    return { ok: false, reason: 'Pick a valid shift date.' };
  }
  const today = new Date().toISOString().slice(0, 10);
  if (input.shiftDate < today) {
    return { ok: false, reason: 'Shift date must be today or later.' };
  }
  if (!Number.isFinite(input.hours) || input.hours <= 0 || input.hours > 24) {
    return { ok: false, reason: 'Hours must be between 1 and 24.' };
  }
  if (
    !Number.isInteger(input.hourlyRateCents) ||
    input.hourlyRateCents <= 0 ||
    input.hourlyRateCents > 1_000_000
  ) {
    return { ok: false, reason: 'Enter a positive hourly rate.' };
  }
  const location = input.location.trim();
  if (!location) {
    return { ok: false, reason: 'Add a location (city, state).' };
  }

  const payer = await getPayer(session.payerId);
  const id = randomUUID();
  const totalCents = Math.round(input.hourlyRateCents * input.hours);

  const meta: ServiceMeta = {
    id,
    role,
    shiftDate: input.shiftDate,
    hours: Number(input.hours),
    hourlyRateCents: input.hourlyRateCents,
    totalCents,
    location,
    ownerId: session.payerId,
    ownerHandle: handleFor(payer),
    postedAt: new Date().toISOString(),
    status: 'available',
  };

  await writeMeta(meta);
  await Promise.all([
    redis.sadd(POSTED_KEY(session.payerId), id),
    redis.sadd(AVAILABLE_KEY, id),
  ]);

  return { ok: true, service: meta };
}

/** Take a still-available shift down from the marketplace. */
export async function unlistService(id: string): Promise<ServiceMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const meta = await readMeta(id);
  if (!meta) return { ok: false, reason: 'Shift not found.' };
  if (meta.ownerId !== session.payerId) {
    return { ok: false, reason: 'You did not post this shift.' };
  }
  if (meta.status === 'booked') {
    return {
      ok: false,
      reason: 'Already booked — cannot remove a hired shift.',
    };
  }

  await Promise.all([
    redis.srem(AVAILABLE_KEY, id),
    redis.srem(POSTED_KEY(session.payerId), id),
    redis.del(META_KEY(id)),
  ]);

  return { ok: true };
}

/**
 * Hire a posted shift. Settles buyer → poster wallet via Root subaccount move,
 * then marks the shift as booked.
 */
export async function hireService(id: string): Promise<ServiceMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const meta = await readMeta(id);
  if (!meta) return { ok: false, reason: 'Shift no longer available.' };
  if (meta.status !== 'available') {
    return { ok: false, reason: 'Shift has already been booked.' };
  }
  if (meta.ownerId === session.payerId) {
    return { ok: false, reason: 'You cannot hire your own posted shift.' };
  }

  const buyerPayer = await getPayer(session.payerId);
  const sellerPayer = await getPayer(meta.ownerId);

  if (!buyerPayer?.subaccountId) {
    return { ok: false, reason: 'Your wallet is not enabled yet.' };
  }
  if (!sellerPayer?.subaccountId) {
    return {
      ok: false,
      reason: 'The poster has not enabled a wallet; the hire cannot settle.',
    };
  }

  let buyerSnap;
  try {
    buyerSnap = await getSubaccountLedgerSnapshot(buyerPayer.subaccountId);
  } catch {
    return { ok: false, reason: 'Could not read your wallet balance. Try again.' };
  }

  if (buyerSnap.balanceCents < meta.totalCents) {
    return {
      ok: false,
      reason: `Insufficient wallet balance. You need ${formatMoney(meta.totalCents)} available.`,
    };
  }

  try {
    await moveRootSubaccountFunds({
      from_subaccount_id: buyerPayer.subaccountId,
      to_subaccount_id: sellerPayer.subaccountId,
      amount_in_cents: meta.totalCents,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Wallet transfer failed.';
    return { ok: false, reason: msg };
  }

  meta.status = 'booked';
  meta.bookedBy = session.payerId;
  meta.bookedByHandle = handleFor(buyerPayer);
  meta.bookedAt = new Date().toISOString();
  await writeMeta(meta);
  await redis.srem(AVAILABLE_KEY, id);

  return { ok: true };
}

/**
 * Live Dental Dynamics wallet balance via {@link getSubaccountLedgerSnapshot}
 * (`total_incoming_cents` / `total_outgoing_cents`). Not cached. Returns disabled
 * when no subaccount is provisioned.
 */
export type WalletStatus = {
  enabled: boolean;
  subaccountId: string | null;
  balanceCents: Money | null;
  incomingCents: Money | null;
  outgoingCents: Money | null;
};

export async function getMyWalletStatus(): Promise<WalletStatus> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      enabled: false,
      subaccountId: null,
      balanceCents: null,
      incomingCents: null,
      outgoingCents: null,
    };
  }
  const payer = await getPayer(session.payerId);
  if (!payer?.subaccountId) {
    return {
      enabled: false,
      subaccountId: null,
      balanceCents: null,
      incomingCents: null,
      outgoingCents: null,
    };
  }

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

/** Available role options used by the post-shift form. */
export async function getRoleOptions(): Promise<string[]> {
  return Array.from(ROLE_OPTIONS);
}
