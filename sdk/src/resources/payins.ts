import type { RootClient } from '../client.js'
import { waitForTerminal, type WaitForTerminalOptions } from '../poll.js'
import type { ListResponse, Payin, PayinRail } from '../types.js'

export interface CreatePayinBody {
  payer_id: string
  amount_in_cents: number
  /** Payins only support ACH rails. */
  rail?: PayinRail
  subaccount_id?: string
  /** Defaults to `true` for demo deterministic flow. */
  auto_approve?: boolean
  currency_code?: string
  metadata?: Record<string, unknown>
}

export interface ListPayinsParams {
  payer_name?: string
  amount_gte?: number
  amount_lte?: number
  created_at_gte?: string
  created_at_lte?: string
  rail?: PayinRail
  status?: string
  limit?: number
  cursor?: string
  subaccount_id?: string
}

export class PayinsResource {
  constructor(private readonly client: RootClient) {}

  /**
   * `POST /api/payins/`
   *
   * Defaults: `rail = 'standard_ach'`, `auto_approve = true`, `currency_code = 'USD'`.
   * Payins only accept ACH rails — passing `instant_bank` / `instant_card` / `wire`
   * will return a 4xx from the API.
   */
  create(body: CreatePayinBody): Promise<Payin> {
    return this.client.post<Payin>('/api/payins/', {
      rail: 'standard_ach',
      auto_approve: true,
      currency_code: 'USD',
      ...body,
    })
  }

  /** `GET /api/payins/{id}` */
  get(payinId: string): Promise<Payin> {
    return this.client.get<Payin>(`/api/payins/${encodeURIComponent(payinId)}`)
  }

  /** `GET /api/payins/` */
  list(params?: ListPayinsParams): Promise<ListResponse<Payin>> {
    return this.client.get<ListResponse<Payin>>('/api/payins/', {
      query: params as Record<string, unknown> | undefined,
    })
  }

  /** `POST /api/payins/{id}/approve` (only needed when `auto_approve: false`). */
  approve(payinId: string): Promise<Payin> {
    return this.client.post<Payin>(`/api/payins/${encodeURIComponent(payinId)}/approve`)
  }

  /** `DELETE /api/payins/{id}` */
  cancel(payinId: string): Promise<void> {
    return this.client.delete<void>(`/api/payins/${encodeURIComponent(payinId)}`)
  }

  /** Poll `GET /api/payins/{id}` until terminal. Uses rail-aware defaults. */
  waitForTerminal(
    payinId: string,
    opts?: Omit<WaitForTerminalOptions<Payin>, 'isTerminal'>,
  ): Promise<Payin> {
    return waitForTerminal(() => this.get(payinId), opts)
  }
}
