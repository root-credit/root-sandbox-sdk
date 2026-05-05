'use server';

/**
 * Employee-side server actions: email-only login, profile read, attach
 * payment method.
 *
 * Cache policy (minimal — per project rule):
 *   - We DO NOT add any new payee→payer mapping cache. That mapping already
 *     lives on the existing `payee:<id>` Redis record (it stores `payerId`).
 *   - The only new key we write is `emp_session:<token>` (TTL 24h) holding
 *     `{ payeeId, payerId, payeeEmail }` so the cookie-bound session can be
 *     resolved on every request without extra lookups.
 *   - Payment-method state is treated as Root-authoritative: when the
 *     employee attaches a method, we call Root first, then mirror the
 *     resulting `payment_method_id` onto the existing `payee:<id>` record so
 *     the operator console can show "method on file". We do not maintain a
 *     separate cache for it.
 *
 * Why this lives here (not under `app/actions/*`):
 *   - The protected-paths rule keeps `app/actions/*`, `lib/hooks/*`,
 *     `lib/types/*`, `app/api/*`, and `lib/redis*.ts` off-limits. Server
 *     actions can live in any `'use server'` module, so the new
 *     employee-side flow is contained here.
 */

import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  getPayee,
  getPayer,
  getPayerTransactions,
  redis,
  setPayee,
  type PayeeRecord,
  type PayerRecord,
} from '@/lib/redis';
import {
  attachPayeeBankAccount,
  attachPayeeDebitCard,
  getPayoutStatus,
} from '@/lib/root-api';
import { PaymentMethodType } from '@/lib/types/payments';
import type { Money } from '@/lib/types/payments';
import type { Transaction } from '@/lib/types/payout';

const EMPLOYEE_COOKIE = 'emp_session';
const EMPLOYEE_TTL_SEC = 86_400;

export type EmployeeSession = {
  payeeId: string;
  payerId: string;
  payeeEmail: string;
};

function generateToken(): string {
  return randomUUID().replace(/-/g, '');
}

function parseStoredJson<T>(data: unknown): T | null {
  if (data == null) return null;
  if (typeof data === 'object') return data as T;
  if (typeof data === 'string') return JSON.parse(data) as T;
  return null;
}

async function setEmployeeSession(
  token: string,
  data: EmployeeSession,
): Promise<void> {
  await redis.setex(
    `emp_session:${token}`,
    EMPLOYEE_TTL_SEC,
    JSON.stringify(data),
  );
}

async function getEmployeeSessionFromRedis(
  token: string,
): Promise<EmployeeSession | null> {
  const raw = await redis.get(`emp_session:${token}`);
  return parseStoredJson<EmployeeSession>(raw);
}

async function deleteEmployeeSession(token: string): Promise<void> {
  await redis.del(`emp_session:${token}`);
}

/**
 * Find a payee by email. Scans `payee:*` keys; acceptable for the demo / sandbox.
 * Per the cache rule we deliberately do NOT add an email->id index.
 */
async function findPayeeByEmail(email: string): Promise<PayeeRecord | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const keys = await redis.keys('payee:*');
  for (const key of keys) {
    if (key.split(':').length !== 2) continue;
    const data = await redis.get(key);
    const payee = parseStoredJson<PayeeRecord>(data);
    if (payee && payee.email.trim().toLowerCase() === target) {
      return payee;
    }
  }
  return null;
}

export type EmployeeLoginResult = {
  success: true;
  payeeId: string;
  payerId: string;
};

/**
 * Sign an employee in by email. The employee account must already have been
 * created by the operator on the payer side.
 */
export async function signInEmployee(
  emailInput: string,
): Promise<EmployeeLoginResult> {
  if (typeof emailInput !== 'string' || !emailInput.includes('@')) {
    throw new Error('Enter a valid email address');
  }

  const payee = await findPayeeByEmail(emailInput);
  if (!payee) {
    throw new Error(
      'No account found with that email. Ask your restaurant to add you in their console.',
    );
  }

  const token = generateToken();
  await setEmployeeSession(token, {
    payeeId: payee.id,
    payerId: payee.payerId,
    payeeEmail: payee.email,
  });

  const cookieStore = await cookies();
  cookieStore.set(EMPLOYEE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EMPLOYEE_TTL_SEC,
  });

  return { success: true, payeeId: payee.id, payerId: payee.payerId };
}

export async function signOutEmployee(): Promise<{ success: true }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_COOKIE)?.value;
  if (token) {
    await deleteEmployeeSession(token);
  }
  cookieStore.set(EMPLOYEE_COOKIE, '', { path: '/', maxAge: 0 });
  return { success: true };
}

/**
 * Read the current employee session. Returns null when no cookie / expired.
 * Safe to call from server components (uses `cookies()` only).
 */
export async function getCurrentEmployeeSession(): Promise<EmployeeSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_COOKIE)?.value;
  if (!token) return null;
  return getEmployeeSessionFromRedis(token);
}

export type EmployeeProfile = {
  payee: PayeeRecord;
  employerName: string;
  hasPaymentMethod: boolean;
};

/**
 * Read the signed-in employee's profile + employer display name.
 *
 * We deliberately do not pre-fetch Root payment-method details here. The
 * `paymentMethodId` field on the payee record IS the signal that a method has
 * been attached at Root (it is set in {@link attachMyEmployeePaymentMethod}
 * the moment Root acknowledges the attach). For full per-method receipt data,
 * the UI can call Root directly, but for the "method on file?" question this
 * single sentinel is enough and avoids an extra cache.
 */
export async function getMyEmployeeProfile(): Promise<EmployeeProfile | null> {
  const session = await getCurrentEmployeeSession();
  if (!session) return null;
  const payee = await getPayee(session.payeeId);
  if (!payee) return null;
  const employer: PayerRecord | null = await getPayer(payee.payerId);
  return {
    payee,
    employerName: employer?.payerName ?? 'Your restaurant',
    hasPaymentMethod: Boolean(
      payee.paymentMethodId && payee.paymentMethodId.length > 0,
    ),
  };
}

export type AttachEmployeePaymentMethodInput =
  | {
      type: 'bank_account';
      accountNumber: string;
      routingNumber: string;
    }
  | {
      type: 'debit_card';
      cardNumber: string;
      expiryMonth: number;
      expiryYear: number;
    };

export type AttachEmployeePaymentMethodResult = {
  success: true;
  paymentMethodId: string;
  paymentMethodType: 'bank_account' | 'debit_card';
};

/**
 * Attach a payment method to the employee at Root, then mirror the resulting
 * `payment_method_id` onto the existing payee record so the operator side
 * sees "method on file" without any new cache layer.
 */
export async function attachMyEmployeePaymentMethod(
  input: AttachEmployeePaymentMethodInput,
): Promise<AttachEmployeePaymentMethodResult> {
  const session = await getCurrentEmployeeSession();
  if (!session) {
    throw new Error('Not signed in');
  }
  const payee = await getPayee(session.payeeId);
  if (!payee) {
    throw new Error('Profile not found');
  }

  let paymentMethodId: string;
  let paymentMethodType: 'bank_account' | 'debit_card';

  if (input.type === 'bank_account') {
    const result = await attachPayeeBankAccount(payee.rootPayeeId, {
      accountNumber: input.accountNumber,
      routingNumber: input.routingNumber,
    });
    paymentMethodId = result.id || payee.rootPayeeId;
    paymentMethodType = PaymentMethodType.BankAccount;
  } else {
    const result = await attachPayeeDebitCard(payee.rootPayeeId, {
      cardNumber: input.cardNumber,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
    });
    paymentMethodId = result.id || payee.rootPayeeId;
    paymentMethodType = PaymentMethodType.DebitCard;
  }

  await setPayee(payee.id, {
    ...payee,
    paymentMethodId,
    paymentMethodType,
    updatedAt: Date.now(),
  });

  revalidatePath('/employee');
  revalidatePath('/dashboard/payees');

  return { success: true, paymentMethodId, paymentMethodType };
}

/**
 * Paystub history for the signed-in employee.
 *
 * Source of truth:
 *   - Ledger rows are read from Redis (`getPayerTransactions(payerId)`), the
 *     same store the operator-side activity feed uses. We then filter to the
 *     rows for the current employee (`payeeId`) only.
 *   - Per-row status is hydrated live from Root via `getPayoutStatus(...)`,
 *     identical to the pattern in `app/actions/transactions.ts`. This keeps
 *     state authoritative on Root and avoids any new cache key.
 */
export type PaystubsSummary = {
  paystubs: Transaction[];
  totalGrossCents: Money;
  paidCents: Money;
  pendingCents: Money;
  payCount: number;
  lastPaidAt: number | null;
};

const SUCCESS_STATUSES = new Set(['success', 'completed']);
const PENDING_STATUSES = new Set(['pending']);

export async function getMyPaystubs(): Promise<PaystubsSummary> {
  const session = await getCurrentEmployeeSession();
  if (!session) {
    throw new Error('Not signed in');
  }

  const all = (await getPayerTransactions(session.payerId)) as Transaction[];
  const mine = all.filter((t) => t.payeeId === session.payeeId);

  const hydrated = await Promise.all(
    mine.map(async (t) => {
      const payoutId = t.rootPayoutId?.trim();
      if (!payoutId) return t;
      try {
        const remote = await getPayoutStatus(payoutId);
        return { ...t, status: remote.status };
      } catch {
        return t;
      }
    }),
  );

  hydrated.sort((a, b) => b.createdAt - a.createdAt);

  let paidCents: Money = 0;
  let pendingCents: Money = 0;
  let lastPaidAt: number | null = null;

  for (const t of hydrated) {
    const status = (t.status || '').toLowerCase();
    if (SUCCESS_STATUSES.has(status)) {
      paidCents += t.amountCents;
      const completedAt = t.completedAt || t.createdAt;
      if (lastPaidAt == null || completedAt > lastPaidAt) {
        lastPaidAt = completedAt;
      }
    } else if (PENDING_STATUSES.has(status)) {
      pendingCents += t.amountCents;
    }
  }

  return {
    paystubs: hydrated,
    totalGrossCents: paidCents + pendingCents,
    paidCents,
    pendingCents,
    payCount: hydrated.length,
    lastPaidAt,
  };
}
