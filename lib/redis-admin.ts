import { redis, getPayee, deletePayee } from "./redis";

/**
 * Deletes every key in the current Upstash Redis database (`FLUSHDB`).
 * Sandbox-only — wipes payers, payees, sessions, transactions, app settings,
 * marketplace/domain keys, and anything else stored in this DB.
 */
export async function flushEntireDatabase(): Promise<void> {
  await redis.flushdb();
}

async function delKeys(keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;
  const chunk = 100;
  let n = 0;
  for (let i = 0; i < keys.length; i += chunk) {
    const slice = keys.slice(i, i + chunk);
    await redis.del(...slice);
    n += slice.length;
  }
  return n;
}

/** Delete every `payee:*` key and every `payer:*:payees` set. */
export async function clearAllPayeesData(): Promise<{ deletedKeys: number }> {
  const payeeKeys = await redis.keys("payee:*");
  const payeeSetKeys = await redis.keys("payer:*:payees");
  const n = (await delKeys(payeeKeys)) + (await delKeys(payeeSetKeys));
  return { deletedKeys: n };
}

/** Remove one payee and its membership set entry. */
export async function removePayeeById(payeeId: string): Promise<boolean> {
  const p = await getPayee(payeeId);
  if (!p?.payerId) return false;
  await deletePayee(payeeId, p.payerId);
  return true;
}

/** All `session:*` operator sessions (not admin_session — different prefix). */
export async function clearAllOperatorSessions(): Promise<{ deletedKeys: number }> {
  const keys = await redis.keys("session:*");
  return { deletedKeys: await delKeys(keys) };
}

/** All transactions and per-payer transaction index sets. */
export async function clearAllTransactions(): Promise<{ deletedKeys: number }> {
  const txKeys = await redis.keys("transaction:*");
  const idxKeys = await redis.keys("payer:*:transactions");
  const n = (await delKeys(txKeys)) + (await delKeys(idxKeys));
  return { deletedKeys: n };
}

/** Strip bankAccountToken from each `payer:{uuid}` record (root keys only). */
export async function clearAllPayerBankFields(): Promise<{ updated: number }> {
  const keys = await redis.keys("payer:*");
  const rootKeys = keys.filter((k) => k.split(":").length === 2);
  let updated = 0;
  for (const key of rootKeys) {
    const raw = await redis.get(key);
    let data: Record<string, unknown> | null = null;
    if (raw != null && typeof raw === "object") {
      data = { ...(raw as Record<string, unknown>) };
    } else if (typeof raw === "string") {
      try {
        data = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        continue;
      }
    }
    if (!data || !("bankAccountToken" in data) || data.bankAccountToken == null) {
      continue;
    }
    delete data.bankAccountToken;
    data.updatedAt = Date.now();
    await redis.set(key, JSON.stringify(data));
    updated++;
  }
  return { updated };
}
