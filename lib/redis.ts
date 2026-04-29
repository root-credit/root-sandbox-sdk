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

// ---------- Sessions ----------
export async function setSession(
  sessionId: string,
  data: { payerEmail: string; payerId: string }
) {
  await redis.setex(
    `session:${sessionId}`,
    86400, // 24 hours
    JSON.stringify(data)
  );
}

export async function getSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`);
  return parseStoredJson<{ payerEmail: string; payerId: string }>(data);
}

export async function deleteSession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}

// ---------- Payers (funding party / operator record) ----------
export interface PayerRecord {
  id: string;
  payerEmail: string;
  payerName: string;
  phone: string;
  rootPayerId: string;
  bankAccountToken?: string;
  createdAt: number;
  updatedAt: number;
}

export async function setPayer(payerId: string, data: PayerRecord) {
  await redis.set(`payer:${payerId}`, JSON.stringify(data));
}

export async function getPayer(payerId: string) {
  const data = await redis.get(`payer:${payerId}`);
  return parseStoredJson<PayerRecord>(data);
}

export async function getPayerByEmail(payerEmail: string) {
  const keys = await redis.keys(`payer:*`);
  for (const key of keys) {
    // Skip nested index keys like "payer:{id}:payees"
    if (key.split(":").length !== 2) continue;
    const data = await redis.get(key);
    const payer = parseStoredJson<PayerRecord>(data);
    if (payer && payer.payerEmail === payerEmail) {
      return payer;
    }
  }
  return null;
}

// ---------- Payees ----------
export interface PayeeRecord {
  id: string;
  payerId: string;
  name: string;
  email: string;
  phone: string;
  paymentMethodId: string;
  paymentMethodType: "bank_account" | "debit_card";
  rootPayeeId: string;
  createdAt: number;
  updatedAt: number;
}

export async function setPayee(payeeId: string, data: PayeeRecord) {
  await redis.set(`payee:${payeeId}`, JSON.stringify(data));
  await redis.sadd(`payer:${data.payerId}:payees`, payeeId);
}

export async function getPayee(payeeId: string) {
  const data = await redis.get(`payee:${payeeId}`);
  return parseStoredJson<PayeeRecord>(data);
}

export async function getPayerPayees(payerId: string) {
  const payeeIds = await redis.smembers(`payer:${payerId}:payees`);
  const payees: PayeeRecord[] = [];
  for (const payeeId of payeeIds) {
    const payee = await getPayee(payeeId);
    if (payee) payees.push(payee);
  }
  return payees;
}

export async function deletePayee(payeeId: string, payerId: string) {
  await redis.del(`payee:${payeeId}`);
  await redis.srem(`payer:${payerId}:payees`, payeeId);
}

// ---------- Transactions ----------
export interface TransactionRecord {
  id: string;
  payerId: string;
  payeeId: string;
  payeeName: string;
  payeeEmail: string;
  amountCents: number;
  amount: number;
  status: string;
  rootPayoutId: string;
  rootTransactionId: string;
  createdAt: number;
  completedAt: number;
}

export async function setTransaction(transactionId: string, data: TransactionRecord) {
  await redis.set(`transaction:${transactionId}`, JSON.stringify(data));
  await redis.sadd(`payer:${data.payerId}:transactions`, transactionId);
}

export async function getTransaction(transactionId: string) {
  const data = await redis.get(`transaction:${transactionId}`);
  return parseStoredJson<TransactionRecord>(data);
}

export async function getPayerTransactions(payerId: string) {
  const transactionIds = await redis.smembers(
    `payer:${payerId}:transactions`
  );
  const transactions: TransactionRecord[] = [];
  for (const transactionId of transactionIds) {
    const transaction = await getTransaction(transactionId);
    if (transaction) transactions.push(transaction);
  }
  return transactions.sort((a, b) => b.createdAt - a.createdAt);
}
