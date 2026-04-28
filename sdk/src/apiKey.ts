/**
 * Root API tokens are opaque strings with a fixed shape enforced by the backend:
 *   `test_<token_id>_<secret>` or `live_<token_id>_<secret>`
 * where `<token_id>` is a UUID. This is the `token_value` from API token provisioning —
 * not a bare UUID, not `client_id` / `client_secret` alone.
 *
 * @see backend/core/security/api_token_auth.py — verify_api_token
 */

const BARE_UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

/** Matches the server-side parser: prefix + UUID token_id + non-empty secret. */
const FULL_TOKEN_RE =
  /^(live|test)_([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})_(.+)$/

export function sanitizeApiKey(raw: string | undefined | null): string {
  if (raw == null) return ''
  let s = String(raw).replace(/^\uFEFF/, '').trim()
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim()
  }
  return s
}

/** True if the string matches the full `test_|live_<uuid>_<secret>` shape. */
export function isLikelyRootApiToken(key: string): boolean {
  return FULL_TOKEN_RE.test(sanitizeApiKey(key))
}

/**
 * If the key is non-empty but not a plausible Root API token, returns a short
 * human-readable hint. Otherwise `null`.
 */
export function apiKeyFormatHint(key: string): string | null {
  const k = sanitizeApiKey(key)
  if (!k) return null
  if (isLikelyRootApiToken(k)) return null
  if (BARE_UUID_RE.test(k)) {
    return (
      'ROOT_API_KEY looks like a bare UUID. Use the full API token string from the Root ' +
      'dashboard or from `token_value` when creating tokens — format: ' +
      '`test_<token_id>_<secret>` or `live_<token_id>_<secret>` (three segments separated by underscores).'
    )
  }
  return (
    'ROOT_API_KEY does not look like a Root API token. Expected `test_<uuid>_<secret>` or ' +
    '`live_<uuid>_<secret>`. Copy the entire `token_value`, not just the UUID part.'
  )
}

/** For logs only — never log the full key. */
export function describeApiKeyForLogs(key: string): string {
  const k = sanitizeApiKey(key)
  if (!k) return '(empty)'
  const prefix = k.slice(0, Math.min(8, k.length))
  const suffix = k.length > 4 ? k.slice(-4) : ''
  const looks = isLikelyRootApiToken(k) ? 'shape=ok' : 'shape=suspicious'
  return `${looks} len=${k.length} preview=${prefix}…${suffix}`
}
