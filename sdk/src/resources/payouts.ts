import type { RootClient } from '../client.js'
import { waitForTerminal, type WaitForTerminalOptions } from '../poll.js'
import type { ListResponse, Payout, PayoutRail } from '../types.js'

export interface CreatePayoutBody {
  payee_id: string
  amount_in_cents: number
  rail: PayoutRail
  subaccount_id?: string
  /** Defaults to `true` for demo deterministic flow (skips manual approval). */
  auto_approve?: boolean
  currency_code?: string
  metadata?: Record<string, unknown>
}

export interface ListPayoutsParams {
  rail?: PayoutRail
  status?: string
  amount_gte?: number
  amount_lte?: number
  payee_name?: string
  limit?: number
  cursor?: string
  subaccount_id?: string
}

export class PayoutsResource {
  constructor(private readonly client: RootClient) {}

  /**
   * `POST /api/payouts/`
   *
   * `auto_approve` defaults to `true` so the demo flow advances without a
   * manual approval step. Pass `auto_approve: false` to keep the transfer in
   * `created` until you call an approval API.
   */
  create(body: CreatePayoutBody): Promise<Payout> {
    return this.client.post<Payout>('/api/payouts/', {
      auto_approve: true,
      currency_code: 'USD',
      ...body,
    })
  }

  /** `GET /api/payouts/{id}` */
  get(payoutId: string): Promise<Payout> {
    return this.client.get<Payout>(`/api/payouts/${encodeURIComponent(payoutId)}`)
  }

  /** `GET /api/payouts` */
  list(params?: ListPayoutsParams): Promise<ListResponse<Payout>> {
    return this.client.get<ListResponse<Payout>>('/api/payouts', {
      query: params as Record<string, unknown> | undefined,
    })
  }

  /** `DELETE /api/payouts/{id}` */
  cancel(payoutId: string): Promise<void> {
    return this.client.delete<void>(`/api/payouts/${encodeURIComponent(payoutId)}`)
  }

  /**
   * Poll `GET /api/payouts/{id}` until it reaches a terminal status
   * (`debited`, `settled`, `failed`, or `canceled`). Uses rail-aware defaults
   * for poll interval and timeout.
   */
  waitForTerminal(
    payoutId: string,
    opts?: Omit<WaitForTerminalOptions<Payout>, 'isTerminal'>,
  ): Promise<Payout> {
    return waitForTerminal(() => this.get(payoutId), opts)
  }
}
