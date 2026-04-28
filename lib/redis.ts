import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    "Missing Upstash Redis environment variables. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * We store JSON with `JSON.stringify`. `@upstash/redis` enables automatic JSON deserialization
 * by default, so `get` may return either a string or an already-parsed object. Calling
 * `JSON.parse` on an object stringifies to "[object Object]" and throws "is not valid JSON".
 */
function parseStoredJson<T = any>(data: unknown): T | null {
  if (data == null) return null;
  if (typeof data === "object") return data as T;
  if (typeof data === "string") return JSON.parse(data) as T;
  return null;
}

// Session utilities
export async function setSession(
  sessionId: string,
  data: { adminEmail: string; restaurantId: string }
) {
  await redis.setex(
    `session:${sessionId}`,
    86400, // 24 hours
    JSON.stringify(data)
  );
}

export async function getSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`);
  return parseStoredJson(data);
}

export async function deleteSession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}

// Restaurant utilities
export async function setRestaurant(
  restaurantId: string,
  data: {
    id: string;
    adminEmail: string;
    restaurantName: string;
    phone: string;
    rootCustomerId: string;
    bankAccountToken?: string;
    createdAt: number;
    updatedAt: number;
  }
) {
  await redis.set(
    `restaurant:${restaurantId}`,
    JSON.stringify(data)
  );
}

export async function getRestaurant(restaurantId: string) {
  const data = await redis.get(`restaurant:${restaurantId}`);
  return parseStoredJson(data);
}

export async function getRestaurantByEmail(adminEmail: string) {
  const keys = await redis.keys(`restaurant:*`);
  for (const key of keys) {
    const data = await redis.get(key);
    const restaurant = parseStoredJson(data);
    if (restaurant && restaurant.adminEmail === adminEmail) {
      return restaurant;
    }
  }
  return null;
}

// Worker utilities
export async function setWorker(workerId: string, data: any) {
  await redis.set(`worker:${workerId}`, JSON.stringify(data));
  const restaurantId = data.restaurantId;
  await redis.sadd(`restaurant:${restaurantId}:workers`, workerId);
}

export async function getWorker(workerId: string) {
  const data = await redis.get(`worker:${workerId}`);
  return parseStoredJson(data);
}

export async function getRestaurantWorkers(restaurantId: string) {
  const workerIds = await redis.smembers(`restaurant:${restaurantId}:workers`);
  const workers = [];
  for (const workerId of workerIds) {
    const worker = await getWorker(workerId);
    if (worker) workers.push(worker);
  }
  return workers;
}

export async function deleteWorker(workerId: string, restaurantId: string) {
  await redis.del(`worker:${workerId}`);
  await redis.srem(`restaurant:${restaurantId}:workers`, workerId);
}

// Transaction utilities
export async function setTransaction(transactionId: string, data: any) {
  await redis.set(`transaction:${transactionId}`, JSON.stringify(data));
  const restaurantId = data.restaurantId;
  await redis.sadd(`restaurant:${restaurantId}:transactions`, transactionId);
}

export async function getTransaction(transactionId: string) {
  const data = await redis.get(`transaction:${transactionId}`);
  return parseStoredJson(data);
}

export async function getRestaurantTransactions(restaurantId: string) {
  const transactionIds = await redis.smembers(`restaurant:${restaurantId}:transactions`);
  const transactions = [];
  for (const transactionId of transactionIds) {
    const transaction = await getTransaction(transactionId);
    if (transaction) transactions.push(transaction);
  }
  return transactions.sort((a, b) => b.createdAt - a.createdAt);
}
