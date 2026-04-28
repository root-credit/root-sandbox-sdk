import type { RootClient } from '../client.js'
import { DEFAULT_TEST_BANK, DEFAULT_TEST_CARD } from '../constants.js'
import type { ListResponse, Payee, PayeePaymentMethod } from '../types.js'

export interface ListPayeesParams {
  name?: string
  email?: string
  has_default?: boolean
  limit?: number
  cursor?: string
}

export interface CreatePayeeBody {
  name: string
  email: string
  metadata?: Record<string, unknown>
}

export interface UpdatePayeeBody {
  name?: string
  email?: string
  metadata?: Record<string, unknown>
}

export interface AttachPayToBankBody {
  account_number?: string
  routing_number?: string
  routing_number_type?: string
}

export interface AttachPushToCardBody {
  card_number?: string
  card_expiry_date?: string
}

export class PayeesResource {
  constructor(private readonly client: RootClient) {}

  /** `POST /api/payees/` */
  create(body: CreatePayeeBody): Promise<Payee> {
    return this.client.post<Payee>('/api/payees/', body)
  }

  /** `GET /api/payees/{id}` */
  get(payeeId: string): Promise<Payee> {
    return this.client.get<Payee>(`/api/payees/${encodeURIComponent(payeeId)}`)
  }

  /** `GET /api/payees` */
  list(params?: ListPayeesParams): Promise<ListResponse<Payee>> {
    return this.client.get<ListResponse<Payee>>('/api/payees', {
      query: params as Record<string, unknown> | undefined,
    })
  }

  /** `PATCH /api/payees/{id}` */
  update(payeeId: string, body: UpdatePayeeBody): Promise<Payee> {
    return this.client.patch<Payee>(`/api/payees/${encodeURIComponent(payeeId)}`, body)
  }

  /** Convenience: find a payee by exact email match (case-insensitive). */
  async findByEmail(email: string): Promise<Payee | null> {
    const list = await this.list({ email, limit: 5 })
    const lower = email.toLowerCase()
    return list.data?.find((p) => p.email.toLowerCase() === lower) ?? null
  }

  /**
   * `POST /api/payees/{id}/payment-methods/pay-to-bank`
   *
   * Defaults to a sandbox-allowed test account/routing pair if no body is passed.
   * Pass `account_number` / `routing_number` from `ALLOWED_TEST_*` constants to override.
   */
  attachPayToBank(payeeId: string, body?: AttachPayToBankBody): Promise<PayeePaymentMethod> {
    return this.client.post<PayeePaymentMethod>(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/pay-to-bank`,
      {
        account_number: body?.account_number ?? DEFAULT_TEST_BANK.account_number,
        routing_number: body?.routing_number ?? DEFAULT_TEST_BANK.routing_number,
        routing_number_type: body?.routing_number_type ?? DEFAULT_TEST_BANK.routing_number_type,
      },
    )
  }

  /**
   * `POST /api/payees/{id}/payment-methods/push-to-card`
   *
   * Defaults to a sandbox-allowed Visa test card if no body is passed.
   */
  attachPushToCard(
    payeeId: string,
    body?: AttachPushToCardBody,
  ): Promise<PayeePaymentMethod> {
    return this.client.post<PayeePaymentMethod>(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/push-to-card`,
      {
        card_number: body?.card_number ?? DEFAULT_TEST_CARD.card_number,
        card_expiry_date: body?.card_expiry_date ?? DEFAULT_TEST_CARD.card_expiry_date,
      },
    )
  }

  /** `GET /api/payees/{id}/payment-methods` */
  listPaymentMethods(payeeId: string): Promise<ListResponse<PayeePaymentMethod>> {
    return this.client.get<ListResponse<PayeePaymentMethod>>(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods`,
    )
  }

  /** `GET /api/payees/{payee_id}/payment-methods/{pm_id}` */
  getPaymentMethod(payeeId: string, pmId: string): Promise<PayeePaymentMethod> {
    return this.client.get<PayeePaymentMethod>(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/${encodeURIComponent(pmId)}`,
    )
  }

  /** `POST /api/payees/{payee_id}/payment-methods/{pm_id}/set-default` */
  setDefaultPaymentMethod(payeeId: string, pmId: string): Promise<PayeePaymentMethod> {
    return this.client.post<PayeePaymentMethod>(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/${encodeURIComponent(pmId)}/set-default`,
    )
  }

  /** `DELETE /api/payees/{payee_id}/payment-methods/{pm_id}` */
  deletePaymentMethod(payeeId: string, pmId: string): Promise<void> {
    return this.client.delete<void>(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/${encodeURIComponent(pmId)}`,
    )
  }
}
