/**
 * High-level orchestrators for the most common demo flows.
 *
 * These exist so a v0-generated app can do the full money-out / money-in
 * dance in a single call rather than wiring 4–5 sequential API requests
 * in user-space code (which is where the AI tends to get lost).
 */

import type { PayeesResource } from './resources/payees.js'
import type { PayersResource } from './resources/payers.js'
import type { PayinsResource } from './resources/payins.js'
import type { PayoutsResource } from './resources/payouts.js'
import type { SubaccountsResource } from './resources/subaccounts.js'
import type {
  Payee,
  PayeePaymentMethod,
  Payer,
  PayerPaymentMethod,
  Payin,
  PayinRail,
  Payout,
  PayoutRail,
  SubaccountMove,
  TransferStatus,
} from './types.js'
import { payeeNameForTransaction } from './constants.js'

export interface PayToInput {
  /** Payee details. If `name` matches an existing payee email, the existing record is reused. */
  payee: { name: string; email: string; metadata?: Record<string, unknown> }
  amount_in_cents: number
  rail: PayoutRail
  /** Payment method. Provide `bank` OR `card`. Defaults to a sandbox-allowed test bank. */
  paymentMethod?:
    | { bank: { account_number?: string; routing_number?: string; routing_number_type?: string } }
    | { card: { card_number?: string; card_expiry_date?: string } }
  /** Subaccount the payout draws from. If omitted, the SDK uses `subaccounts.getOrCreateDefault()`. */
  subaccount_id?: string
  /** Currency. Defaults to `USD`. */
  currency_code?: string
  /** Arbitrary metadata stored on the payout. */
  metadata?: Record<string, unknown>
  /** When `true`, replaces the payee name with `John Failed` for this transfer. */
  simulateFailure?: boolean
  /**
   * If `true`, the flow polls until the payout reaches a terminal status
   * before resolving. Default `true`.
   */
  waitForTerminal?: boolean
  /** Called for each status update during polling. */
  onStatus?: (status: TransferStatus, payout: Payout) => void
}

export interface PayToResult {
  payee: Payee
  paymentMethod: PayeePaymentMethod
  payout: Payout
  /** Final payout snapshot after polling. Same as `payout` if `waitForTerminal: false`. */
  finalPayout: Payout
}

export interface ChargeFromInput {
  /** Payer details. */
  payer: { name: string; email: string; metadata?: Record<string, unknown> }
  amount_in_cents: number
  /** ACH only. Defaults to `standard_ach`. */
  rail?: PayinRail
  /** Pay-by-bank account. Defaults to a sandbox-allowed test bank. */
  bank?: { account_number?: string; routing_number?: string; routing_number_type?: string }
  subaccount_id?: string
  currency_code?: string
  metadata?: Record<string, unknown>
  simulateFailure?: boolean
  waitForTerminal?: boolean
  onStatus?: (status: TransferStatus, payin: Payin) => void
}

export interface ChargeFromResult {
  payer: Payer
  paymentMethod: PayerPaymentMethod
  payin: Payin
  finalPayin: Payin
}

/** Instant move between two subaccounts (same entity). */
export interface MoveBetweenSubaccountsInput {
  from_subaccount_id: string
  to_subaccount_id: string
  amount_in_cents: number
}

/**
 * ACH pull from an existing payer's linked pay-by-bank method into a subaccount.
 * Preconditions: Root payer exists and has a default (or usable) pay-by-bank PM attached.
 * Does not create payers or attach banks — use {@link Flows.chargeFrom} for full onboarding.
 */
export interface FundSubaccountFromExistingPayerInput {
  payer_id: string
  amount_in_cents: number
  rail: PayinRail
  subaccount_id: string
  currency_code?: string
  metadata?: Record<string, unknown>
  /**
   * If `true`, polls until the payin reaches a terminal status. Default `true`.
   */
  waitForTerminal?: boolean
  onStatus?: (status: TransferStatus, payin: Payin) => void
}

export interface FundSubaccountFromExistingPayerResult {
  payin: Payin
  /** Snapshot after polling when `waitForTerminal` is not `false`. */
  finalPayin: Payin
}

export class Flows {
  constructor(
    private readonly payees: PayeesResource,
    private readonly payers: PayersResource,
    private readonly payouts: PayoutsResource,
    private readonly payins: PayinsResource,
    private readonly subaccounts: SubaccountsResource,
  ) {}

  /**
   * One-shot money-out flow:
   *   1. Reuse-or-create the payee (matched by email).
   *   2. Attach a payment method (bank by default; card if `paymentMethod.card` is provided).
   *   3. Resolve the subaccount (uses default if not given).
   *   4. Create the payout with `auto_approve: true`.
   *   5. (optional) Poll until terminal.
   */
  async payTo(input: PayToInput): Promise<PayToResult> {
    const displayName = payeeNameForTransaction(
      input.payee.name,
      Boolean(input.simulateFailure),
    )

    const existing = await this.payees.findByEmail(input.payee.email)
    const payee =
      existing ??
      (await this.payees.create({
        name: displayName,
        email: input.payee.email,
        metadata: input.payee.metadata,
      }))

    // Update name if simulateFailure flipped it after the payee was created.
    const payeeForTransfer =
      existing && existing.name !== displayName
        ? await this.payees.update(existing.id, { name: displayName })
        : payee

    const paymentMethod = await attachPayeePaymentMethod(
      this.payees,
      payeeForTransfer.id,
      input.paymentMethod,
    )

    const subaccountId =
      input.subaccount_id ?? (await this.subaccounts.getOrCreateDefault()).id

    const payout = await this.payouts.create({
      payee_id: payeeForTransfer.id,
      amount_in_cents: input.amount_in_cents,
      rail: input.rail,
      subaccount_id: subaccountId,
      auto_approve: true,
      currency_code: input.currency_code ?? 'USD',
      metadata: input.metadata,
    })

    let finalPayout = payout
    if (input.waitForTerminal !== false) {
      finalPayout = await this.payouts.waitForTerminal(payout.id, {
        rail: input.rail,
        onUpdate: (snap) => input.onStatus?.(snap.status, snap),
      })
    }

    return { payee: payeeForTransfer, paymentMethod, payout, finalPayout }
  }

  /**
   * One-shot money-in flow:
   *   1. Reuse-or-create the payer.
   *   2. Attach a pay-by-bank method.
   *   3. Resolve the subaccount.
   *   4. Create the payin with `auto_approve: true` (ACH only).
   *   5. (optional) Poll until terminal.
   */
  async chargeFrom(input: ChargeFromInput): Promise<ChargeFromResult> {
    const displayName = payeeNameForTransaction(
      input.payer.name,
      Boolean(input.simulateFailure),
    )

    const existing = await this.payers.findByEmail(input.payer.email)
    const payer =
      existing ??
      (await this.payers.create({
        name: displayName,
        email: input.payer.email,
        metadata: input.payer.metadata,
      }))

    const payerForTransfer =
      existing && existing.name !== displayName
        ? await this.payers.update(existing.id, { name: displayName })
        : payer

    const paymentMethod = await this.payers.attachPayByBank(
      payerForTransfer.id,
      input.bank,
      { is_default: true },
    )

    const subaccountId =
      input.subaccount_id ?? (await this.subaccounts.getOrCreateDefault()).id

    const rail: PayinRail = input.rail ?? 'standard_ach'
    const payin = await this.payins.create({
      payer_id: payerForTransfer.id,
      amount_in_cents: input.amount_in_cents,
      rail,
      subaccount_id: subaccountId,
      auto_approve: true,
      currency_code: input.currency_code ?? 'USD',
      metadata: input.metadata,
    })

    let finalPayin = payin
    if (input.waitForTerminal !== false) {
      finalPayin = await this.payins.waitForTerminal(payin.id, {
        rail,
        onUpdate: (snap) => input.onStatus?.(snap.status, snap),
      })
    }

    return { payer: payerForTransfer, paymentMethod, payin, finalPayin }
  }

  /**
   * Move funds instantly between two subaccounts (`POST /api/subaccounts/move`).
   */
  async moveBetweenSubaccounts(input: MoveBetweenSubaccountsInput): Promise<SubaccountMove> {
    return this.subaccounts.move({
      from_subaccount_id: input.from_subaccount_id,
      to_subaccount_id: input.to_subaccount_id,
      amount_in_cents: input.amount_in_cents,
    })
  }

  /**
   * Create a payin (ACH pull) funding `subaccount_id` using the payer's existing bank PM.
   * Mirrors the payin + poll portion of {@link Flows.chargeFrom}.
   */
  async fundSubaccountFromExistingPayer(
    input: FundSubaccountFromExistingPayerInput,
  ): Promise<FundSubaccountFromExistingPayerResult> {
    const rail: PayinRail = input.rail
    const payin = await this.payins.create({
      payer_id: input.payer_id,
      amount_in_cents: input.amount_in_cents,
      rail,
      subaccount_id: input.subaccount_id,
      auto_approve: true,
      currency_code: input.currency_code ?? 'USD',
      metadata: input.metadata,
    })

    let finalPayin = payin
    if (input.waitForTerminal !== false) {
      finalPayin = await this.payins.waitForTerminal(payin.id, {
        rail,
        onUpdate: (snap) => input.onStatus?.(snap.status, snap),
      })
    }

    return { payin, finalPayin }
  }
}

async function attachPayeePaymentMethod(
  payees: PayeesResource,
  payeeId: string,
  pm: PayToInput['paymentMethod'],
): Promise<PayeePaymentMethod> {
  if (pm && 'card' in pm) {
    return payees.attachPushToCard(payeeId, pm.card)
  }
  const bank = pm && 'bank' in pm ? pm.bank : undefined
  return payees.attachPayToBank(payeeId, bank)
}
