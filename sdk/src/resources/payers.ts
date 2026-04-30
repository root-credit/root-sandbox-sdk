import type { RootClient } from '../client.js'
import { ALLOWED_TEST_ROUTING_NUMBERS, DEFAULT_TEST_BANK, ROOT_LIST_BY_EMAIL_MIN_LIMIT } from '../constants.js'
import type { ListResponse, Payer, PayerPaymentMethod } from '../types.js'

export interface ListPayersParams {
  name?: string
  email?: string
  has_default?: boolean
  limit?: number
  cursor?: string
}

export interface CreatePayerBody {
  name?: string
  email?: string
  metadata?: Record<string, unknown>
}

export interface UpdatePayerBody {
  name?: string
  email?: string
  metadata?: Record<string, unknown>
}

export interface AttachPayByBankBody {
  account_number?: string
  routing_number?: string
  routing_number_type?: string
}

/** Query params for `attachPayByBank`. */
export interface AttachPayByBankQuery {
  is_default?: boolean
  /** Associate the payment method with this subaccount when supported by the API. */
  subaccount_id?: string
}

export class PayersResource {
  constructor(private readonly client: RootClient) {}

  /** `POST /api/payers/` */
  create(body?: CreatePayerBody): Promise<Payer> {
    return this.client.post<Payer>('/api/payers/', body ?? {})
  }

  /** `GET /api/payers/{id}` */
  get(payerId: string): Promise<Payer> {
    return this.client.get<Payer>(`/api/payers/${encodeURIComponent(payerId)}`)
  }

  /** `GET /api/payers` */
  list(params?: ListPayersParams): Promise<ListResponse<Payer>> {
    return this.client.get<ListResponse<Payer>>('/api/payers', {
      query: params as Record<string, unknown> | undefined,
    })
  }

  /** `PATCH /api/payers/{id}` */
  update(payerId: string, body: UpdatePayerBody): Promise<Payer> {
    return this.client.patch<Payer>(`/api/payers/${encodeURIComponent(payerId)}`, body)
  }

  /** Convenience: find payer by email (case-insensitive). Uses {@link ROOT_LIST_BY_EMAIL_MIN_LIMIT} for list queries. */
  async findByEmail(email: string): Promise<Payer | null> {
    const list = await this.list({ email, limit: ROOT_LIST_BY_EMAIL_MIN_LIMIT })
    const lower = email.toLowerCase()
    return list.data?.find((p) => p.email.toLowerCase() === lower) ?? null
  }

  /**
   * `POST /api/payers/{id}/payment-methods/pay-by-bank`
   *
   * Defaults to a sandbox-allowed account/routing pair. Note that payers use
   * a different default routing number than payees in the sandbox.
   */
  attachPayByBank(
    payerId: string,
    body?: AttachPayByBankBody,
    query?: AttachPayByBankQuery,
  ): Promise<PayerPaymentMethod> {
    const q: Record<string, unknown> = { is_default: query?.is_default ?? true }
    if (query?.subaccount_id) q.subaccount_id = query.subaccount_id
    return this.client.post<PayerPaymentMethod>(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/pay-by-bank`,
      {
        account_number: body?.account_number ?? DEFAULT_TEST_BANK.account_number,
        routing_number: body?.routing_number ?? ALLOWED_TEST_ROUTING_NUMBERS[0],
        routing_number_type: body?.routing_number_type ?? 'aba',
      },
      { query: q },
    )
  }

  /** `GET /api/payers/{payer_id}/payment-methods` */
  listPaymentMethods(payerId: string): Promise<ListResponse<PayerPaymentMethod>> {
    return this.client.get<ListResponse<PayerPaymentMethod>>(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods`,
    )
  }

  /** `GET /api/payers/{payer_id}/payment-methods/{pm_id}` */
  getPaymentMethod(payerId: string, pmId: string): Promise<PayerPaymentMethod> {
    return this.client.get<PayerPaymentMethod>(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/${encodeURIComponent(pmId)}`,
    )
  }

  /** `GET /api/payers/{payer_id}/payment-methods/default` */
  getDefaultPaymentMethod(payerId: string): Promise<PayerPaymentMethod> {
    return this.client.get<PayerPaymentMethod>(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/default`,
    )
  }

  /** `POST /api/payers/{payer_id}/payment-methods/{pm_id}/set-default` */
  setDefaultPaymentMethod(payerId: string, pmId: string): Promise<PayerPaymentMethod> {
    return this.client.post<PayerPaymentMethod>(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/${encodeURIComponent(pmId)}/set-default`,
    )
  }

  /** `DELETE /api/payers/{payer_id}/payment-methods/{pm_id}` */
  deletePaymentMethod(payerId: string, pmId: string): Promise<void> {
    return this.client.delete<void>(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/${encodeURIComponent(pmId)}`,
    )
  }
}
