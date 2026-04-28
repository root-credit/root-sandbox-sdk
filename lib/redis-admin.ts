import { redis, getWorker, deleteWorker } from "./redis";

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

/** Delete every `worker:*` key and every `restaurant:*:workers` set. */
export async function clearAllWorkersData(): Promise<{ deletedKeys: number }> {
  const workerKeys = await redis.keys("worker:*");
  const workerSetKeys = await redis.keys("restaurant:*:workers");
  const n =
    (await delKeys(workerKeys)) + (await delKeys(workerSetKeys));
  return { deletedKeys: n };
}

/** Remove one worker and its membership set entry. */
export async function removeWorkerById(workerId: string): Promise<boolean> {
  const w = await getWorker(workerId);
  if (!w?.restaurantId) return false;
  await deleteWorker(workerId, w.restaurantId);
  return true;
}

/** All `session:*` restaurant user sessions (not admin_session — different prefix). */
export async function clearAllRestaurantSessions(): Promise<{ deletedKeys: number }> {
  const keys = await redis.keys("session:*");
  return { deletedKeys: await delKeys(keys) };
}

/** All transactions and per-restaurant transaction index sets. */
export async function clearAllTransactions(): Promise<{ deletedKeys: number }> {
  const txKeys = await redis.keys("transaction:*");
  const idxKeys = await redis.keys("restaurant:*:transactions");
  const n = (await delKeys(txKeys)) + (await delKeys(idxKeys));
  return { deletedKeys: n };
}

/** Strip bankAccountToken from each `restaurant:{uuid}` record (root keys only). */
export async function clearAllRestaurantBankFields(): Promise<{ updated: number }> {
  const keys = await redis.keys("restaurant:*");
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
