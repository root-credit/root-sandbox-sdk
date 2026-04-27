import type { RootClient } from '../client.js'
import type { ListResponse, Webhook } from '../types.js'

export class WebhooksResource {
  constructor(private readonly client: RootClient) {}

  /**
   * `POST /api/webhooks`
   *
   * The returned `secret_key` is shown ONLY on create — store it (in memory
   * is fine for a demo) for signature verification.
   */
  create(body: { url: string; description?: string }): Promise<Webhook> {
    return this.client.post<Webhook>('/api/webhooks', body)
  }

  /** `GET /api/webhooks` */
  list(): Promise<ListResponse<Webhook>> {
    return this.client.get<ListResponse<Webhook>>('/api/webhooks')
  }

  /** `GET /api/webhooks/{id}` (does NOT include `secret_key`). */
  get(webhookId: string): Promise<Webhook> {
    return this.client.get<Webhook>(`/api/webhooks/${encodeURIComponent(webhookId)}`)
  }

  /** `POST /api/webhooks/{id}/toggle` — flips `is_active`. */
  toggle(webhookId: string): Promise<Webhook> {
    return this.client.post<Webhook>(
      `/api/webhooks/${encodeURIComponent(webhookId)}/toggle`,
    )
  }

  /** `DELETE /api/webhooks/{id}` */
  delete(webhookId: string): Promise<void> {
    return this.client.delete<void>(`/api/webhooks/${encodeURIComponent(webhookId)}`)
  }
}
