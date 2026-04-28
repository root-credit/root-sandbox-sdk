import { apiKeyFormatHint, sanitizeApiKey } from './apiKey.js'
import { DEFAULT_BASE_URL } from './constants.js'

/** Listener invoked once per HTTP call after the response is received. */
export type RequestObserver = (event: {
  method: string
  path: string
  url: string
  status: number
  ok: boolean
  startedAt: number
  durationMs: number
  requestBody?: unknown
  responseBody?: unknown
  error?: Error
}) => void

export interface RootClientOptions {
  /**
   * Root API key. Send via the `X-API-KEY` header. Defaults to
   * `process.env.ROOT_API_KEY`. Required — server-side only, never expose to the browser.
   */
  apiKey?: string
  /** Override the API host. Defaults to `process.env.ROOT_BASE_URL` or `https://api.useroot.com`. */
  baseUrl?: string
  /** Per-request timeout in ms (default 30s). */
  timeoutMs?: number
  /** How many times to retry on network errors and 5xx (default 1). */
  maxRetries?: number
  /** Custom fetch (mostly for tests). Defaults to global fetch. */
  fetch?: typeof fetch
  /** Optional observer for every HTTP call — useful for "API timeline" panels. */
  onRequest?: RequestObserver
  /** Extra headers added to every request. */
  defaultHeaders?: Record<string, string>
  /**
   * Skip client-side validation that `apiKey` matches `test_<uuid>_<secret>` /
   * `live_<uuid>_<secret>`. The real API still validates; use only for tests
   * or unusual environments.
   */
  allowNonStandardApiKey?: boolean
}

/**
 * Query parameters. Values may be primitives, arrays of strings, or
 * `null`/`undefined`/`''` (which are skipped). Typed via `unknown` so any
 * caller-side interface (e.g. `ListPayoutsParams`) is accepted without
 * needing an explicit index signature.
 */
export type QueryParams = Record<string, unknown>

export interface RequestOptions {
  /** HTTP method. Defaults to GET. */
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  /** Body — will be JSON-stringified. */
  body?: unknown
  /** Query parameters; falsy values are skipped. Arrays repeat the key. */
  query?: QueryParams
  /** Per-call header overrides. */
  headers?: Record<string, string>
  /** Per-call timeout override (ms). */
  timeoutMs?: number
  /** AbortSignal to cancel the request. */
  signal?: AbortSignal
}

/** Thrown for any non-2xx Root response. Includes the parsed body and raw text. */
export class RootApiError extends Error {
  status: number
  method: string
  path: string
  /** Parsed JSON body if the response was JSON, otherwise undefined. */
  body?: unknown
  /** Raw response text. */
  rawText: string
  /** Best-effort error code/key extracted from the response body. */
  code?: string

  constructor(args: {
    status: number
    method: string
    path: string
    rawText: string
    body?: unknown
  }) {
    const friendly = extractFriendlyMessage(args.body, args.rawText)
    super(`Root API ${args.method} ${args.path} failed: ${args.status} ${friendly}`)
    this.name = 'RootApiError'
    this.status = args.status
    this.method = args.method
    this.path = args.path
    this.rawText = args.rawText
    this.body = args.body
    this.code = extractCode(args.body)
  }
}

function extractFriendlyMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>
    if (typeof b.message === 'string') return b.message
    if (typeof b.error === 'string') return b.error
    if (typeof b.detail === 'string') return b.detail
    if (b.errors && typeof b.errors === 'object') {
      try {
        return JSON.stringify(b.errors)
      } catch {
        // ignore
      }
    }
  }
  return fallback || '<empty body>'
}

function extractCode(body: unknown): string | undefined {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>
    if (typeof b.code === 'string') return b.code
    if (typeof b.error_code === 'string') return b.error_code
  }
  return undefined
}

/** Internal: format a query object into a URL search string (no leading `?`). */
function formatQuery(query: RequestOptions['query']): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, raw] of Object.entries(query as Record<string, unknown>)) {
    if (raw === undefined || raw === null || raw === '') continue
    if (Array.isArray(raw)) {
      for (const v of raw) {
        if (v !== undefined && v !== null && v !== '') params.append(key, String(v))
      }
    } else if (
      typeof raw === 'string' ||
      typeof raw === 'number' ||
      typeof raw === 'boolean'
    ) {
      params.set(key, String(raw))
    } else {
      // Skip unsupported types (objects, functions, symbols).
      continue
    }
  }
  return params.toString()
}

type Wrapped<T> = { data: T }

/**
 * Auto-unwrap the `{ data: ... }` envelope for single-object responses.
 * Lists keep their `{ data: [...], has_more, next_cursor }` shape because
 * callers need the cursor.
 */
function unwrapSingle<T>(res: T | Wrapped<T>): T {
  if (
    res &&
    typeof res === 'object' &&
    'data' in (res as Record<string, unknown>) &&
    !Array.isArray((res as Wrapped<unknown>).data)
  ) {
    return (res as Wrapped<T>).data
  }
  return res as T
}

export class RootClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly maxRetries: number
  private readonly fetchImpl: typeof fetch
  private readonly onRequest?: RequestObserver
  private readonly defaultHeaders: Record<string, string>

  constructor(opts: RootClientOptions = {}) {
    const apiKey = sanitizeApiKey(opts.apiKey ?? readEnv('ROOT_API_KEY'))
    if (!apiKey) {
      throw new Error(
        '[root-sandbox-sdk] Missing apiKey. Pass `{ apiKey }` or set ROOT_API_KEY in your server env. ' +
          'NEVER expose this key to the browser.',
      )
    }
    if (!opts.allowNonStandardApiKey) {
      const hint = apiKeyFormatHint(apiKey)
      if (hint) {
        throw new Error(`[root-sandbox-sdk] ${hint}`)
      }
    }
    this.apiKey = apiKey
    this.baseUrl = (opts.baseUrl ?? readEnv('ROOT_BASE_URL') ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeoutMs = opts.timeoutMs ?? 30_000
    this.maxRetries = opts.maxRetries ?? 1
    const f = opts.fetch ?? (globalThis as { fetch?: typeof fetch }).fetch
    if (!f) {
      throw new Error(
        '[root-sandbox-sdk] No global `fetch` available. Use Node 18+ or pass `fetch` in options.',
      )
    }
    this.fetchImpl = f.bind(globalThis)
    this.onRequest = opts.onRequest
    this.defaultHeaders = opts.defaultHeaders ?? {}
  }

  /**
   * Low-level request. Returns the parsed JSON body, with the `{ data }`
   * envelope auto-unwrapped for single-object responses. Throws `RootApiError`
   * on any non-2xx response.
   */
  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const method = opts.method ?? 'GET'
    const qs = formatQuery(opts.query)
    const fullPath = qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path
    const url = `${this.baseUrl}${fullPath}`

    let attempt = 0
    let lastError: unknown
    while (attempt <= this.maxRetries) {
      const startedAt = Date.now()
      const ctrl = new AbortController()
      const timeoutMs = opts.timeoutMs ?? this.timeoutMs
      const timer = setTimeout(() => ctrl.abort(), timeoutMs)
      const externalSignal = opts.signal
      const onAbort = () => ctrl.abort(externalSignal?.reason)
      if (externalSignal) {
        if (externalSignal.aborted) ctrl.abort(externalSignal.reason)
        else externalSignal.addEventListener('abort', onAbort, { once: true })
      }

      try {
        const res = await this.fetchImpl(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-API-KEY': this.apiKey,
            'User-Agent': '@useroot/sandbox-sdk',
            ...this.defaultHeaders,
            ...(opts.headers ?? {}),
          },
          body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
          cache: 'no-store',
          signal: ctrl.signal,
        })

        const rawText = res.status === 204 ? '' : await res.text()
        const body = parseJsonSafe(rawText)
        const durationMs = Date.now() - startedAt

        this.onRequest?.({
          method,
          path: fullPath,
          url,
          status: res.status,
          ok: res.ok,
          startedAt,
          durationMs,
          requestBody: opts.body,
          responseBody: body ?? rawText,
        })

        if (!res.ok) {
          // Retry transient 5xx + 429 once (or as configured).
          if (
            (res.status >= 500 || res.status === 429) &&
            attempt < this.maxRetries
          ) {
            attempt++
            await sleep(backoffDelay(attempt))
            continue
          }
          throw new RootApiError({
            status: res.status,
            method,
            path: fullPath,
            rawText,
            body,
          })
        }
        if (res.status === 204) return undefined as T
        return unwrapSingle<T>(body as T | Wrapped<T>)
      } catch (err) {
        lastError = err
        const isAbort = err instanceof DOMException && err.name === 'AbortError'
        const isApiError = err instanceof RootApiError
        const durationMs = Date.now() - startedAt
        this.onRequest?.({
          method,
          path: fullPath,
          url,
          status: isApiError ? (err as RootApiError).status : 0,
          ok: false,
          startedAt,
          durationMs,
          requestBody: opts.body,
          error: err as Error,
        })
        // RootApiError already retried above; only retry network errors here.
        if (!isApiError && !isAbort && attempt < this.maxRetries) {
          attempt++
          await sleep(backoffDelay(attempt))
          continue
        }
        throw err
      } finally {
        clearTimeout(timer)
        if (externalSignal) externalSignal.removeEventListener('abort', onAbort)
      }
    }
    throw lastError ?? new Error('[root-sandbox-sdk] request exhausted retries')
  }

  /** Convenience: GET. */
  get<T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...opts, method: 'GET' })
  }
  /** Convenience: POST. */
  post<T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...opts, method: 'POST', body })
  }
  /** Convenience: PATCH. */
  patch<T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...opts, method: 'PATCH', body })
  }
  /** Convenience: DELETE. */
  delete<T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...opts, method: 'DELETE' })
  }

  /** Read the resolved base URL (mostly useful for logging). */
  get baseUrlOrigin(): string {
    return this.baseUrl
  }
}

function readEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    const v = process.env[key]
    if (v && v.length > 0) return v
  }
  return undefined
}

function parseJsonSafe(text: string): unknown {
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function backoffDelay(attempt: number): number {
  // 500ms, 1000ms, 2000ms, capped at 4s.
  return Math.min(500 * 2 ** (attempt - 1), 4000)
}
