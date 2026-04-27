import type { RootClient } from '../client.js'
import type { PartySessionToken } from '../types.js'

export class SessionTokensResource {
  constructor(private readonly client: RootClient) {}

  /**
   * `POST /api/session-tokens/party`
   *
   * Mints a short-lived token scoped to a specific payee or payer that can
   * safely be returned to the browser to drive an embedded UI.
   */
  createForParty(body: {
    party_id: string
    party_type?: 'payee' | 'payer'
  }): Promise<PartySessionToken> {
    return this.client.post<PartySessionToken>('/api/session-tokens/party', {
      party_type: 'payee',
      ...body,
    })
  }
}
