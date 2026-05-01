'use server';

/**
 * Airbnb reskin — server actions for short-term rental listings, bookings, and
 * the live Airbnb wallet balance.
 *
 * Why this lives here (and not under `app/actions/*`):
 *   - The protected-paths rule keeps `app/actions/*`, `lib/hooks/*`, `lib/types/*`,
 *     `app/api/*`, and `lib/redis*.ts` off-limits. Next.js allows server actions
 *     in any module that starts with `'use server'`, so the rental marketplace
 *     actions live here and import the existing Redis client read-only.
 *
 * Cache policy:
 *   - Nothing here is cached. The Airbnb wallet balance is fetched live from
 *     Root on every call; rental lists are read directly from Redis with no
 *     SWR/Next cache wrapping.
 *   - The marketplace inventory is *not* bootstrapped — every listing in Redis
 *     was put there by a real signed-in member acting as a host.
 */

import { redis, getPayer } from '@/lib/redis';
import {
  getSubaccountLedgerSnapshot,
  moveRootSubaccountFunds,
} from '@/lib/root-api';
import { getCurrentSession } from '@/lib/session';
import { formatMoney, type Money } from '@/lib/types/payments';

export type ListingStatus = 'available' | 'booked' | 'unlisted';

export type RentalListing = {
  id: string;
  hostId: string;
  hostHandle: string;
  title: string;
  location: string;
  /** Deterministic seed (1..6) used by the UI to pick a cover gradient. */
  coverSeed: number;
  startDate: string;
  endDate: string;
  nights: number;
  totalPriceCents: Money;
  status: ListingStatus;
  bookedById?: string;
  bookedByHandle?: string;
  bookedAt?: string;
  createdAt: string;
};

export type ListingMutationResult =
  | { ok: true }
  | { ok: false; reason: string };

export type CreateListingInput = {
  title: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalPriceDollars: number;
};

const META_KEY = (id: string) => `airbnb:listing:${id}`;
const HOST_INDEX = (payerId: string) => `airbnb:host:${payerId}`;
const BOOKED_BY_INDEX = (payerId: string) => `airbnb:bookedBy:${payerId}`;
const AVAILABLE_INDEX = 'airbnb:available';

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

async function readMeta(id: string): Promise<RentalListing | null> {
  const raw = await redis.get(META_KEY(id));
  return parseStoredJson<RentalListing>(raw);
}

async function writeMeta(meta: RentalListing): Promise<void> {
  await redis.set(META_KEY(meta.id), JSON.stringify(meta));
}

function handleFor(payer: { payerEmail: string } | null): string {
  if (!payer) return '@you';
  const local = payer.payerEmail.split('@')[0] ?? 'you';
  return `@${local}`;
}

function newId(): string {
  return `lst_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function pickCoverSeed(): number {
  // 1..6 — UI keys six gradient palettes off this number.
  return 1 + Math.floor(Math.random() * 6);
}

function diffNights(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

/** All listings hosted by the current member (any status). Live read; no caching. */
export async function getMyListings(): Promise<RentalListing[]> {
  const session = await getCurrentSession();
  if (!session) return [];
  const ids = (await redis.smembers(HOST_INDEX(session.payerId))) ?? [];
  if (ids.length === 0) return [];
  const metas = await Promise.all(ids.map((id) => readMeta(id)));
  return metas
    .filter((m): m is RentalListing => Boolean(m) && m!.hostId === session.payerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Stays I've booked (other hosts' rentals). Live. */
export async function getMyBookings(): Promise<RentalListing[]> {
  const session = await getCurrentSession();
  if (!session) return [];
  const ids = (await redis.smembers(BOOKED_BY_INDEX(session.payerId))) ?? [];
  if (ids.length === 0) return [];
  const metas = await Promise.all(ids.map((id) => readMeta(id)));
  return metas
    .filter((m): m is RentalListing => Boolean(m) && m!.bookedById === session.payerId)
    .sort((a, b) => (b.bookedAt ?? '').localeCompare(a.bookedAt ?? ''));
}

/** Every available listing, excluding the caller's own. Live. */
export async function getAvailableListings(): Promise<RentalListing[]> {
  const session = await getCurrentSession();
  const myId = session?.payerId;
  const ids = (await redis.smembers(AVAILABLE_INDEX)) ?? [];
  if (ids.length === 0) return [];
  const metas = await Promise.all(ids.map((id) => readMeta(id)));
  const listings: RentalListing[] = [];
  for (const m of metas) {
    if (!m || m.status !== 'available') continue;
    if (myId && m.hostId === myId) continue;
    listings.push(m);
  }
  return listings.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Create a new listing as a host. Mocked — no real property exists. */
export async function createListing(
  input: CreateListingInput,
): Promise<ListingMutationResult & { listing?: RentalListing }> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const title = input.title?.trim();
  const location = input.location?.trim();
  if (!title) return { ok: false, reason: 'Give your place a title.' };
  if (!location) return { ok: false, reason: 'Tell guests where it is.' };

  const nights = diffNights(input.startDate, input.endDate);
  if (nights <= 0) {
    return { ok: false, reason: 'Check-out must be after check-in.' };
  }

  const dollars = Number(input.totalPriceDollars);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return { ok: false, reason: 'Set a positive total price.' };
  }
  const totalPriceCents = Math.round(dollars * 100);

  const payer = await getPayer(session.payerId);
  const id = newId();
  const meta: RentalListing = {
    id,
    hostId: session.payerId,
    hostHandle: handleFor(payer),
    title,
    location,
    coverSeed: pickCoverSeed(),
    startDate: input.startDate,
    endDate: input.endDate,
    nights,
    totalPriceCents,
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  await writeMeta(meta);
  await redis.sadd(HOST_INDEX(session.payerId), id);
  await redis.sadd(AVAILABLE_INDEX, id);

  return { ok: true, listing: meta };
}

/** Take a listing off the marketplace without deleting it. */
export async function unlistListing(id: string): Promise<ListingMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const meta = await readMeta(id);
  if (!meta) return { ok: false, reason: 'Listing not found.' };
  if (meta.hostId !== session.payerId) {
    return { ok: false, reason: 'You do not host this listing.' };
  }
  if (meta.status === 'booked') {
    return { ok: false, reason: 'Already booked — cannot unlist.' };
  }

  meta.status = 'unlisted';
  await writeMeta(meta);
  await redis.srem(AVAILABLE_INDEX, id);
  return { ok: true };
}

/** Re-publish a previously unlisted rental back to the marketplace. */
export async function relistListing(id: string): Promise<ListingMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const meta = await readMeta(id);
  if (!meta) return { ok: false, reason: 'Listing not found.' };
  if (meta.hostId !== session.payerId) {
    return { ok: false, reason: 'You do not host this listing.' };
  }
  if (meta.status === 'booked') {
    return { ok: false, reason: 'Already booked — cannot relist.' };
  }

  meta.status = 'available';
  await writeMeta(meta);
  await redis.sadd(AVAILABLE_INDEX, id);
  return { ok: true };
}

/**
 * Book a listing. Settles guest → host wallet via Root subaccount move,
 * then marks the listing as booked and removes it from the marketplace.
 */
export async function bookListing(id: string): Promise<ListingMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const meta = await readMeta(id);
  if (!meta) return { ok: false, reason: 'Listing no longer available.' };
  if (meta.status !== 'available') {
    return { ok: false, reason: 'This stay is no longer bookable.' };
  }
  if (meta.hostId === session.payerId) {
    return { ok: false, reason: 'You cannot book your own stay.' };
  }

  const guestPayer = await getPayer(session.payerId);
  const hostPayer = await getPayer(meta.hostId);

  if (!guestPayer?.subaccountId) {
    return {
      ok: false,
      reason: 'Activate your Airbnb wallet before booking.',
    };
  }
  if (!hostPayer?.subaccountId) {
    return {
      ok: false,
      reason: 'Host has no active wallet; booking cannot settle.',
    };
  }

  let guestSnap;
  try {
    guestSnap = await getSubaccountLedgerSnapshot(guestPayer.subaccountId);
  } catch {
    return { ok: false, reason: 'Could not read your wallet balance. Try again.' };
  }

  if (guestSnap.balanceCents < meta.totalPriceCents) {
    return {
      ok: false,
      reason: `Insufficient wallet balance. You need ${formatMoney(meta.totalPriceCents)} available.`,
    };
  }

  try {
    await moveRootSubaccountFunds({
      from_subaccount_id: guestPayer.subaccountId,
      to_subaccount_id: hostPayer.subaccountId,
      amount_in_cents: meta.totalPriceCents,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Wallet transfer failed.';
    return { ok: false, reason: msg };
  }

  meta.status = 'booked';
  meta.bookedById = session.payerId;
  meta.bookedByHandle = handleFor(guestPayer);
  meta.bookedAt = new Date().toISOString();
  await writeMeta(meta);

  await Promise.all([
    redis.srem(AVAILABLE_INDEX, id),
    redis.sadd(BOOKED_BY_INDEX(session.payerId), id),
  ]);

  return { ok: true };
}

/**
 * Live Airbnb wallet balance via {@link getSubaccountLedgerSnapshot}
 * (`total_incoming_cents` / `total_outgoing_cents`). Not cached here.
 * Returns disabled when no subaccount.
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
