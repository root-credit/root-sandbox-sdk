/**
 * Shared types for the Root sandbox SDK.
 *
 * The Root API wraps single-object responses in `{ data: ... }` and list responses
 * in `{ data: [...], has_more, next_cursor }`. The SDK auto-unwraps `data` for single
 * objects and returns the wrapper as-is for lists (so callers can paginate).
 */

export type PayoutRail =
  | 'instant_bank'
  | 'instant_card'
  | 'same_day_ach'
  | 'standard_ach'
  | 'wire'

export type PayinRail = 'standard_ach' | 'same_day_ach'

export type TransferStatus =
  | 'created'
  | 'approved'
  | 'initiated'
  | 'processing'
  | 'debited'
  | 'settled'
  | 'failed'
  | 'canceled'
  | 'needs_review'
  | (string & {}) // future-compatible

export interface ListResponse<T> {
  data: T[]
  has_more?: boolean
  next_cursor?: string | null
  previous_cursor?: string | null
  total_count?: number
}

export interface Subaccount {
  id: string
  name: string
  account_number?: string
  routing_number?: string
  /** Lifetime incoming totals from Root (`GET /api/subaccounts/{id}`). */
  total_incoming_cents?: number
  /** Lifetime outgoing totals from Root. */
  total_outgoing_cents?: number
  created_at?: string
  updated_at?: string
}

export interface Payee {
  id: string
  name: string
  email: string
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface Payer {
  id: string
  name: string
  email: string
  client_metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface PayeePaymentMethod {
  id: string
  payee_id: string
  account_last_four?: string
  routing_number?: string
  card_last_four?: string
  card_brand?: string
  verification_status?: string
  is_default?: boolean
  supported_rails?: PayoutRail[]
  created_at?: string
  updated_at?: string
}

export interface PayerPaymentMethod {
  id: string
  payer_id: string
  account_last_four?: string
  routing_number?: string
  verification_status?: string
  is_default?: boolean
  supported_rails?: PayinRail[]
  created_at?: string
  updated_at?: string
}

export interface Payout {
  id: string
  payee_id: string
  amount_in_cents: number
  currency_code: string
  status: TransferStatus
  rail?: PayoutRail
  subaccount_id?: string
  client_metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface Payin {
  id: string
  payer_id: string
  amount_in_cents: number
  currency_code: string
  rail: PayinRail
  status: TransferStatus
  status_recorded_at?: string
  subaccount_id?: string
  payin_metadata?: Record<string, unknown>
  client_metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface SubaccountMove {
  id: string
  from_subaccount_id: string
  to_subaccount_id: string
  amount_in_cents: number
  created_at?: string
  updated_at?: string
}

export interface Webhook {
  id: string
  url: string
  description?: string
  is_active: boolean
  /** Returned only on create. */
  secret_key?: string
  created_at?: string
  updated_at?: string
}

export interface PartySessionToken {
  token: string
  expires_in_seconds: number
  scopes?: string[]
}
