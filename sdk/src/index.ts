/**
 * @useroot/sandbox-sdk — tiny deterministic SDK for the Root sandbox APIs.
 *
 * Designed for v0-generated demo apps:
 *  - One auth path (`X-API-KEY` from env), one base URL, one error class.
 *  - Resource methods that auto-unwrap the `{ data }` envelope.
 *  - Per-rail polling helper (`waitForTerminal`) with sensible defaults.
 *  - Sandbox-allowed test bank/card/routing numbers baked in as constants.
 *  - High-level flows (`flows.payTo`, `flows.chargeFrom`,
 *    `flows.moveBetweenSubaccounts`, `flows.fundSubaccountFromExistingPayer`) for orchestrated demos.
 */

import { RootClient, type RootClientOptions } from './client.js'
import { PayeesResource } from './resources/payees.js'
import { PayersResource } from './resources/payers.js'
import { PayinsResource } from './resources/payins.js'
import { PayoutsResource } from './resources/payouts.js'
import { SessionTokensResource } from './resources/sessionTokens.js'
import { SubaccountsResource } from './resources/subaccounts.js'
import { WebhooksResource } from './resources/webhooks.js'
import { Flows } from './flows.js'

export class Root {
  /** Underlying HTTP client. Use `root.request(...)` for endpoints not yet covered by a resource. */
  readonly client: RootClient
  readonly subaccounts: SubaccountsResource
  readonly payees: PayeesResource
  readonly payers: PayersResource
  readonly payouts: PayoutsResource
  readonly payins: PayinsResource
  readonly webhooks: WebhooksResource
  readonly sessionTokens: SessionTokensResource
  readonly flows: Flows

  constructor(opts: RootClientOptions = {}) {
    this.client = new RootClient(opts)
    this.subaccounts = new SubaccountsResource(this.client)
    this.payees = new PayeesResource(this.client)
    this.payers = new PayersResource(this.client)
    this.payouts = new PayoutsResource(this.client)
    this.payins = new PayinsResource(this.client)
    this.webhooks = new WebhooksResource(this.client)
    this.sessionTokens = new SessionTokensResource(this.client)
    this.flows = new Flows(
      this.payees,
      this.payers,
      this.payouts,
      this.payins,
      this.subaccounts,
    )
  }

  /** Escape hatch for endpoints not yet covered by a resource. */
  request<T>(...args: Parameters<RootClient['request']>): Promise<T> {
    return this.client.request<T>(...args)
  }
}

/** Functional alias if you prefer `createRoot()` over `new Root()`. */
export function createRoot(opts: RootClientOptions = {}): Root {
  return new Root(opts)
}

// ── Re-exports ──────────────────────────────────────────────────────────────

export { RootClient, RootApiError } from './client.js'
export type {
  QueryParams,
  RequestObserver,
  RequestOptions,
  RootClientOptions,
} from './client.js'

export {
  apiKeyFormatHint,
  describeApiKeyForLogs,
  isLikelyRootApiToken,
  sanitizeApiKey,
} from './apiKey.js'

export {
  ALLOWED_TEST_ACCOUNT_NUMBERS,
  ALLOWED_TEST_CARD_NUMBERS,
  ALLOWED_TEST_ROUTING_NUMBERS,
  DEFAULT_BASE_URL,
  DEFAULT_POLLING,
  DEFAULT_TEST_BANK,
  DEFAULT_TEST_CARD,
  FAILURE_SIMULATION_NAME,
  RAIL_POLLING,
  ROOT_LIST_BY_EMAIL_MIN_LIMIT,
  TEST_CARD_EXPIRY,
  payeeNameForTransaction,
} from './constants.js'

export {
  TERMINAL_STATUSES,
  isSuccess,
  isTerminal,
  statusLabel,
  terminalForRail,
} from './status.js'

export {
  RootPollTimeoutError,
  waitForTerminal,
  type WaitForTerminalOptions,
} from './poll.js'

export { paginate, collectAll, type PaginationParams } from './pagination.js'

export { SubaccountsResource } from './resources/subaccounts.js'
export type { ListSubaccountsParams } from './resources/subaccounts.js'

export { PayeesResource } from './resources/payees.js'
export type {
  AttachPayToBankBody,
  AttachPushToCardBody,
  CreatePayeeBody,
  ListPayeesParams,
  UpdatePayeeBody,
} from './resources/payees.js'

export { PayersResource } from './resources/payers.js'
export type {
  AttachPayByBankBody,
  AttachPayByBankQuery,
  CreatePayerBody,
  ListPayersParams,
  UpdatePayerBody,
} from './resources/payers.js'

export { PayoutsResource } from './resources/payouts.js'
export type { CreatePayoutBody, ListPayoutsParams } from './resources/payouts.js'

export { PayinsResource } from './resources/payins.js'
export type { CreatePayinBody, ListPayinsParams } from './resources/payins.js'

export { WebhooksResource } from './resources/webhooks.js'
export { SessionTokensResource } from './resources/sessionTokens.js'

export {
  Flows,
  type ChargeFromInput,
  type ChargeFromResult,
  type FundSubaccountFromExistingPayerInput,
  type FundSubaccountFromExistingPayerResult,
  type MoveBetweenSubaccountsInput,
  type PayToInput,
  type PayToResult,
} from './flows.js'

export type {
  ListResponse,
  PartySessionToken,
  Payee,
  PayeePaymentMethod,
  Payer,
  PayerPaymentMethod,
  Payin,
  PayinRail,
  Payout,
  PayoutRail,
  Subaccount,
  SubaccountMove,
  TransferStatus,
  Webhook,
} from './types.js'

export default Root
