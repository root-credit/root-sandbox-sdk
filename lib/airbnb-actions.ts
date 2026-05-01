'use server';

/**
 * Airbnb reskin — server actions for short-term rental listings, bookings, and
 * the live Airbnb wallet balance.
 *
 * Why this lives here (and not under `app/actions/*`):
 *   - The protected-paths rule keeps `app/actions/*`, `lib/hooks/*`, `lib/types/*`,
 *     `app/api/*`, and `lib/redis*.ts` off-limits. Next.js allows server actions
 *     in any module that starts with `'use server'`, so the new listing actions
 *     live in `lib/airbnb-actions.ts` and import the existing Redis client read-only.
 *
 * Cache policy:
 *   - Nothing here is cached. The Airbnb wallet balance is fetched live from Root
 *     on every call; the marketplace and owned listings are read directly from
 *     Redis with no SWR/Next cache wrapping.
 *   - Listing inventory is *not* bootstrapped — every listing in Redis was put
 *     there by an actual host listing their home for rent.
 */

import { redis, getPayer } from '@/lib/redis';
import {
  getSubaccountLedgerSnapshot,
  moveRootSubaccountFunds,
} from '@/lib/root-api';
import { getCurrentSession } from '@/lib/session';
import { formatMoney, type Money } from '@/lib/types/payments';

export type ListingStatus = 'available' | 'booked';

export type ListingRecord = {
  id: string;
  hostId: string;
  hostHandle: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  pricePerNightCents: Money;
  checkIn: string; // ISO date YYYY-MM-DD
  checkOut: string; // ISO date YYYY-MM-DD
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
  description: string;
  pricePerNightDollars: number;
  checkIn: string;
  checkOut: string;
};

const META_KEY = (id: string) => `airbnb:listing:${id}`;
const AVAILABLE_KEY = 'airbnb:available';
const HOSTED_KEY = (payerId: string) => `airbnb:hosted:${payerId}`;
const TRIPS_KEY = (payerId: string) => `airbnb:trips:${payerId}`;

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

async function readListing(id: string): Promise<ListingRecord | null> {
  const raw = await redis.get(META_KEY(id));
  return parseStoredJson<ListingRecord>(raw);
}

async function writeListing(record: ListingRecord): Promise<void> {
  await redis.set(META_KEY(record.id), JSON.stringify(record));
}

function handleFor(payer: { payerEmail: string } | null): string {
  if (!payer) return '@you';
  const local = payer.payerEmail.split('@')[0] ?? 'you';
  return `@${local}`;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(checkIn + 'T00:00:00Z');
  const b = Date.parse(checkOut + 'T00:00:00Z');
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / (24 * 60 * 60 * 1000)));
}

function imageSeedFor(id: string): string {
  return `https://picsum.photos/seed/airbnb-${encodeURIComponent(id)}/960/640`;
}

function newListingId(): string {
  return `lst_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** All listings hosted by the signed-in user. Live read; no caching. */
export async function getMyHostedListings(): Promise<ListingRecord[]> {
  const session = await getCurrentSession();
  if (!session) return [];
  const ids = (await redis.smembers(HOSTED_KEY(session.payerId))) ?? [];
  if (ids.length === 0) return [];
  const records = await Promise.all(ids.map((id) => readListing(id)));
  return records
    .filter((r): r is ListingRecord => Boolean(r) && r!.hostId === session.payerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** All trips (bookings) the signed-in user has made. Live read. */
export async function getMyTrips(): Promise<ListingRecord[]> {
  const session = await getCurrentSession();
  if (!session) return [];
  const ids = (await redis.smembers(TRIPS_KEY(session.payerId))) ?? [];
  if (ids.length === 0) return [];
  const records = await Promise.all(ids.map((id) => readListing(id)));
  return records
    .filter((r): r is ListingRecord => Boolean(r) && r!.bookedById === session.payerId)
    .sort((a, b) => (b.bookedAt ?? '').localeCompare(a.bookedAt ?? ''));
}

/** All available listings except the caller's own. Live read; no caching. */
export async function getMarketplaceListings(): Promise<ListingRecord[]> {
  const session = await getCurrentSession();
  const myId = session?.payerId;
  const ids = (await redis.smembers(AVAILABLE_KEY)) ?? [];
  if (ids.length === 0) return [];
  const records = await Promise.all(ids.map((id) => readListing(id)));
  const out: ListingRecord[] = [];
  for (const r of records) {
    if (!r || r.status !== 'available') continue;
    if (myId && r.hostId === myId) continue;
    out.push(r);
  }
  return out.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

/** Host a new listing. Mocked — purely Redis-backed. */
export async function createListing(
  input: CreateListingInput,
): Promise<ListingMutationResult & { listing?: ListingRecord }> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const title = input.title.trim();
  const location = input.location.trim();
  const description = input.description.trim();

  if (title.length < 3) {
    return { ok: false, reason: 'Title must be at least 3 characters.' };
  }
  if (location.length < 2) {
    return { ok: false, reason: 'Tell guests where the home is located.' };
  }
  if (!ISO_DATE.test(input.checkIn) || !ISO_DATE.test(input.checkOut)) {
    return { ok: false, reason: 'Pick valid check-in and check-out dates.' };
  }
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights <= 0) {
    return { ok: false, reason: 'Check-out must be after check-in.' };
  }
  const pricePerNightCents = Math.round((input.pricePerNightDollars || 0) * 100);
  if (pricePerNightCents <= 0) {
    return { ok: false, reason: 'Enter a positive nightly price.' };
  }

  const payer = await getPayer(session.payerId);
  const id = newListingId();
  const totalPriceCents = pricePerNightCents * nights;

  const record: ListingRecord = {
    id,
    hostId: session.payerId,
    hostHandle: handleFor(payer),
    title,
    location,
    description: description || `A great place to stay in ${location}.`,
    imageUrl: imageSeedFor(id),
    pricePerNightCents,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights,
    totalPriceCents,
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  await writeListing(record);
  await Promise.all([
    redis.sadd(HOSTED_KEY(session.payerId), id),
    redis.sadd(AVAILABLE_KEY, id),
  ]);

  return { ok: true, listing: record };
}

/** Remove a listing from the marketplace. Allowed only while still available. */
export async function unlistListing(id: string): Promise<ListingMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const record = await readListing(id);
  if (!record) return { ok: false, reason: 'Listing not found.' };
  if (record.hostId !== session.payerId) {
    return { ok: false, reason: 'You do not own this listing.' };
  }
  if (record.status !== 'available') {
    return { ok: false, reason: 'This listing has already been booked.' };
  }

  await Promise.all([
    redis.srem(AVAILABLE_KEY, id),
    redis.srem(HOSTED_KEY(session.payerId), id),
    redis.del(META_KEY(id)),
  ]);
  return { ok: true };
}

/**
 * Book an available listing. Settles guest → host wallet via Root subaccount
 * move, then writes the booked status into Redis.
 */
export async function bookListing(id: string): Promise<ListingMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const record = await readListing(id);
  if (!record) return { ok: false, reason: 'Listing no longer available.' };
  if (record.status !== 'available') {
    return { ok: false, reason: 'This listing is already booked.' };
  }
  if (record.hostId === session.payerId) {
    return { ok: false, reason: 'You cannot book your own listing.' };
  }

  const guestPayer = await getPayer(session.payerId);
  const hostPayer = await getPayer(record.hostId);

  if (!guestPayer?.subaccountId) {
    return {
      ok: false,
      reason: 'Activate your Airbnb wallet before booking a stay.',
    };
  }
  if (!hostPayer?.subaccountId) {
    return {
      ok: false,
      reason: "Host has not activated a wallet; we can't settle this booking.",
    };
  }

  let guestSnap;
  try {
    guestSnap = await getSubaccountLedgerSnapshot(guestPayer.subaccountId);
  } catch {
    return { ok: false, reason: 'Could not read your wallet balance. Try again.' };
  }

  if (guestSnap.balanceCents < record.totalPriceCents) {
    return {
      ok: false,
      reason: `Insufficient wallet balance. You need ${formatMoney(record.totalPriceCents)} available.`,
    };
  }

  try {
    await moveRootSubaccountFunds({
      from_subaccount_id: guestPayer.subaccountId,
      to_subaccount_id: hostPayer.subaccountId,
      amount_in_cents: record.totalPriceCents,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Wallet transfer failed.';
    return { ok: false, reason: msg };
  }

  record.status = 'booked';
  record.bookedById = session.payerId;
  record.bookedByHandle = handleFor(guestPayer);
  record.bookedAt = new Date().toISOString();
  await writeListing(record);

  await Promise.all([
    redis.srem(AVAILABLE_KEY, record.id),
    redis.sadd(TRIPS_KEY(session.payerId), record.id),
  ]);

  return { ok: true };
}

/**
 * Live Airbnb wallet balance via {@link getSubaccountLedgerSnapshot} (`total_incoming_cents` /
 * `total_outgoing_cents`). Not cached here. Returns disabled when no subaccount.
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
