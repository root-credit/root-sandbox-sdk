'use server';

/**
 * GoDaddy reskin — server actions for domains and the live GAG wallet balance.
 *
 * Why this lives here (and not under `app/actions/*`):
 *   - The protected-paths rule keeps `app/actions/*`, `lib/hooks/*`, `lib/types/*`,
 *     `app/api/*`, and `lib/redis*.ts` off-limits. Next.js allows server actions
 *     in any module that starts with `'use server'`, so these new domain
 *     marketplace actions live in `lib/godaddy-actions.ts` and import the
 *     existing Redis client read-only.
 *
 * Cache policy:
 *   - Nothing here is cached. The GAG wallet balance is fetched live from Root
 *     on every call; the marketplace and owned-domains lists are read directly
 *     from Redis with no SWR/Next cache wrapping.
 *   - Domain inventory is *not* bootstrapped — every domain in Redis was put
 *     there by an actual user transferring it in.
 */

import { redis, getPayer } from '@/lib/redis';
import {
  getSubaccountLedgerSnapshot,
  moveRootSubaccountFunds,
} from '@/lib/root-api';
import { getCurrentSession } from '@/lib/session';
import { formatMoney, type Money } from '@/lib/types/payments';

export type OwnedDomainRecord = {
  id: string;
  name: string;
  registeredAt: string;
  listingPriceCents?: Money;
};

export type MarketplaceDomainRecord = {
  id: string;
  name: string;
  priceCents: Money;
  sellerHandle: string;
  ownerId: string;
};

export type DomainMutationResult = { ok: true } | { ok: false; reason: string };

type DomainMeta = {
  name: string;
  ownerId: string;
  ownerHandle: string;
  registeredAt: string;
  listingPriceCents?: Money;
};

const META_KEY = (name: string) => `godaddy:domain:${name}`;
const OWNED_KEY = (payerId: string) => `godaddy:owned:${payerId}`;
const MARKETPLACE_KEY = 'godaddy:marketplace';

const DOMAIN_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

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

async function readMeta(name: string): Promise<DomainMeta | null> {
  const raw = await redis.get(META_KEY(name));
  return parseStoredJson<DomainMeta>(raw);
}

async function writeMeta(meta: DomainMeta): Promise<void> {
  await redis.set(META_KEY(meta.name), JSON.stringify(meta));
}

function handleFor(payer: { payerEmail: string } | null): string {
  if (!payer) return '@you';
  const local = payer.payerEmail.split('@')[0] ?? 'you';
  return `@${local}`;
}

/** Owned domains for the signed-in payer. Live read; no caching. */
export async function getMyOwnedDomains(): Promise<OwnedDomainRecord[]> {
  const session = await getCurrentSession();
  if (!session) return [];
  const names = (await redis.smembers(OWNED_KEY(session.payerId))) ?? [];
  if (names.length === 0) return [];
  const metas = await Promise.all(names.map((n) => readMeta(n)));
  return metas
    .filter((m): m is DomainMeta => Boolean(m) && m!.ownerId === session.payerId)
    .map((m) => ({
      id: m.name,
      name: m.name,
      registeredAt: m.registeredAt,
      listingPriceCents: m.listingPriceCents,
    }))
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}

/** All domains currently listed for sale, by anyone (excluding the caller's own). Live. */
export async function getMarketplaceDomains(): Promise<MarketplaceDomainRecord[]> {
  const session = await getCurrentSession();
  const myId = session?.payerId;
  const names = (await redis.smembers(MARKETPLACE_KEY)) ?? [];
  if (names.length === 0) return [];
  const metas = await Promise.all(names.map((n) => readMeta(n)));
  const records: MarketplaceDomainRecord[] = [];
  for (const m of metas) {
    if (!m || m.listingPriceCents == null) continue;
    if (myId && m.ownerId === myId) continue;
    records.push({
      id: m.name,
      name: m.name,
      priceCents: m.listingPriceCents,
      sellerHandle: m.ownerHandle,
      ownerId: m.ownerId,
    });
  }
  return records.sort((a, b) => a.name.localeCompare(b.name));
}

/** Transfer a domain into the caller's account (mocked registration). */
export async function transferInDomain(
  rawName: string,
): Promise<DomainMutationResult & { domain?: OwnedDomainRecord }> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const name = rawName.trim().toLowerCase();
  if (!name || !DOMAIN_REGEX.test(name)) {
    return { ok: false, reason: 'Enter a valid domain like example.com.' };
  }

  const existing = await readMeta(name);
  if (existing) {
    return { ok: false, reason: 'That domain is already registered in the platform.' };
  }

  const payer = await getPayer(session.payerId);
  const meta: DomainMeta = {
    name,
    ownerId: session.payerId,
    ownerHandle: handleFor(payer),
    registeredAt: new Date().toISOString().slice(0, 10),
  };
  await writeMeta(meta);
  await redis.sadd(OWNED_KEY(session.payerId), name);

  return {
    ok: true,
    domain: { id: name, name, registeredAt: meta.registeredAt },
  };
}

/** Put an owned domain on the marketplace at `priceCents`. */
export async function listDomainForSale(
  name: string,
  priceCents: Money,
): Promise<DomainMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    return { ok: false, reason: 'Enter a positive asking price.' };
  }

  const meta = await readMeta(name);
  if (!meta) return { ok: false, reason: 'Domain not found.' };
  if (meta.ownerId !== session.payerId) {
    return { ok: false, reason: 'You do not own this domain.' };
  }

  meta.listingPriceCents = priceCents;
  await writeMeta(meta);
  await redis.sadd(MARKETPLACE_KEY, name);
  return { ok: true };
}

/** Remove a domain from the marketplace; ownership unchanged. */
export async function unlistDomain(name: string): Promise<DomainMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const meta = await readMeta(name);
  if (!meta) return { ok: false, reason: 'Domain not found.' };
  if (meta.ownerId !== session.payerId) {
    return { ok: false, reason: 'You do not own this domain.' };
  }

  meta.listingPriceCents = undefined;
  await writeMeta(meta);
  await redis.srem(MARKETPLACE_KEY, name);
  return { ok: true };
}

/**
 * Buy a listed domain. Settles buyer → seller wallet via Root subaccount move,
 * then transfers Redis ownership.
 */
export async function buyDomain(name: string): Promise<DomainMutationResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, reason: 'Not signed in.' };

  const meta = await readMeta(name);
  if (!meta) return { ok: false, reason: 'Domain no longer available.' };
  if (meta.listingPriceCents == null) return { ok: false, reason: 'Domain is not for sale.' };
  if (meta.ownerId === session.payerId) {
    return { ok: false, reason: 'You already own this domain.' };
  }

  const previousOwnerId = meta.ownerId;
  const buyerPayer = await getPayer(session.payerId);
  const sellerPayer = await getPayer(previousOwnerId);

  if (!buyerPayer?.subaccountId) {
    return {
      ok: false,
      reason: 'Enable your GAG wallet before purchasing.',
    };
  }
  if (!sellerPayer?.subaccountId) {
    return {
      ok: false,
      reason: 'Seller has not enabled a wallet; purchase cannot settle.',
    };
  }

  let buyerSnap;
  try {
    buyerSnap = await getSubaccountLedgerSnapshot(buyerPayer.subaccountId);
  } catch {
    return { ok: false, reason: 'Could not read your wallet balance. Try again.' };
  }

  if (buyerSnap.balanceCents < meta.listingPriceCents) {
    return {
      ok: false,
      reason: `Insufficient wallet balance. You need ${formatMoney(meta.listingPriceCents)} available.`,
    };
  }

  try {
    await moveRootSubaccountFunds({
      from_subaccount_id: buyerPayer.subaccountId,
      to_subaccount_id: sellerPayer.subaccountId,
      amount_in_cents: meta.listingPriceCents,
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Wallet transfer failed.';
    return { ok: false, reason: msg };
  }

  meta.ownerId = session.payerId;
  meta.ownerHandle = handleFor(buyerPayer);
  meta.listingPriceCents = undefined;
  await writeMeta(meta);

  await Promise.all([
    redis.srem(OWNED_KEY(previousOwnerId), name),
    redis.sadd(OWNED_KEY(session.payerId), name),
    redis.srem(MARKETPLACE_KEY, name),
  ]);

  return { ok: true };
}

/**
 * Live GAG wallet balance via {@link getSubaccountLedgerSnapshot} (`total_incoming_cents` /
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
