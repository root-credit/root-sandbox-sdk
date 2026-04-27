import type { RootClient } from '../client.js'
import type { ListResponse, Subaccount, SubaccountMove } from '../types.js'

export interface ListSubaccountsParams {
  parent_account_id?: string
  bank_config_id?: string[]
  cursor?: string
  limit?: number
  order?: 'asc' | 'desc'
}

export class SubaccountsResource {
  private cachedDefaultId: string | undefined

  constructor(private readonly client: RootClient) {}

  /** `POST /api/subaccounts/` */
  create(body: { name: string }): Promise<Subaccount> {
    return this.client.post<Subaccount>('/api/subaccounts/', body)
  }

  /** `GET /api/subaccounts/{id}` */
  get(subaccountId: string): Promise<Subaccount> {
    return this.client.get<Subaccount>(`/api/subaccounts/${encodeURIComponent(subaccountId)}`)
  }

  /** `PATCH /api/subaccounts/{id}` */
  update(subaccountId: string, body: { name: string }): Promise<Subaccount> {
    return this.client.patch<Subaccount>(
      `/api/subaccounts/${encodeURIComponent(subaccountId)}`,
      body,
    )
  }

  /** `GET /api/subaccounts` */
  list(params?: ListSubaccountsParams): Promise<ListResponse<Subaccount>> {
    return this.client.get<ListResponse<Subaccount>>('/api/subaccounts', {
      query: params as Record<string, unknown> | undefined,
    })
  }

  /** `POST /api/subaccounts/move` — instant subaccount-to-subaccount transfer. */
  move(body: {
    from_subaccount_id: string
    to_subaccount_id: string
    amount_in_cents: number
  }): Promise<SubaccountMove> {
    return this.client.post<SubaccountMove>('/api/subaccounts/move', body)
  }

  /**
   * Demo helper: return a stable subaccount id for the demo to use, in this priority:
   *
   * 1. `process.env.ROOT_DEFAULT_SUBACCOUNT_ID` if set
   * 2. The first subaccount listed under the entity
   * 3. A freshly created subaccount with the given name (default `Demo Default`)
   *
   * Subsequent calls in the same process are memoized.
   */
  async getOrCreateDefault(opts?: { name?: string; envVar?: string }): Promise<Subaccount> {
    if (this.cachedDefaultId) return this.get(this.cachedDefaultId)
    const envKey = opts?.envVar ?? 'ROOT_DEFAULT_SUBACCOUNT_ID'
    const envId = readEnv(envKey)
    if (envId) {
      this.cachedDefaultId = envId
      return this.get(envId)
    }
    const list = await this.list({ limit: 1 })
    const first = list.data?.[0]
    if (first) {
      this.cachedDefaultId = first.id
      return first
    }
    const created = await this.create({ name: opts?.name ?? 'Demo Default' })
    this.cachedDefaultId = created.id
    return created
  }
}

function readEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    const v = process.env[key]
    if (v && v.length > 0) return v
  }
  return undefined
}
