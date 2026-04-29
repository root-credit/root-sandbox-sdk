// src/apiKey.ts
var BARE_UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
var FULL_TOKEN_RE = /^(live|test)_([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})_(.+)$/;
function sanitizeApiKey(raw) {
  if (raw == null) return "";
  let s = String(raw).replace(/^\uFEFF/, "").trim();
  if (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1).trim();
  }
  return s;
}
function isLikelyRootApiToken(key) {
  return FULL_TOKEN_RE.test(sanitizeApiKey(key));
}
function apiKeyFormatHint(key) {
  const k = sanitizeApiKey(key);
  if (!k) return null;
  if (isLikelyRootApiToken(k)) return null;
  if (BARE_UUID_RE.test(k)) {
    return "ROOT_API_KEY looks like a bare UUID. Use the full API token string from the Root dashboard or from `token_value` when creating tokens \u2014 format: `test_<token_id>_<secret>` or `live_<token_id>_<secret>` (three segments separated by underscores).";
  }
  return "ROOT_API_KEY does not look like a Root API token. Expected `test_<uuid>_<secret>` or `live_<uuid>_<secret>`. Copy the entire `token_value`, not just the UUID part.";
}
function describeApiKeyForLogs(key) {
  const k = sanitizeApiKey(key);
  if (!k) return "(empty)";
  const prefix = k.slice(0, Math.min(8, k.length));
  const suffix = k.length > 4 ? k.slice(-4) : "";
  const looks = isLikelyRootApiToken(k) ? "shape=ok" : "shape=suspicious";
  return `${looks} len=${k.length} preview=${prefix}\u2026${suffix}`;
}

// src/constants.ts
var DEFAULT_BASE_URL = "https://api.useroot.com";
var FAILURE_SIMULATION_NAME = "John Failed";
var ALLOWED_TEST_ACCOUNT_NUMBERS = [
  "1234567890",
  "9999999999",
  "0000123456",
  "1111222233"
];
var ALLOWED_TEST_ROUTING_NUMBERS = [
  "111000025",
  "021000021",
  "011401533",
  "091000022"
];
var ALLOWED_TEST_CARD_NUMBERS = [
  "4111111111111111",
  "5555555555554444",
  "378282246310005",
  "6011111111111117"
];
var TEST_CARD_EXPIRY = "6608";
var DEFAULT_TEST_BANK = {
  account_number: ALLOWED_TEST_ACCOUNT_NUMBERS[0],
  routing_number: ALLOWED_TEST_ROUTING_NUMBERS[1],
  routing_number_type: "aba"
};
var DEFAULT_TEST_CARD = {
  card_number: ALLOWED_TEST_CARD_NUMBERS[0],
  card_expiry_date: TEST_CARD_EXPIRY
};
var RAIL_POLLING = {
  instant_bank: { intervalMs: 1500, timeoutMs: 2e4 },
  instant_card: { intervalMs: 1500, timeoutMs: 2e4 },
  same_day_ach: { intervalMs: 3e3, timeoutMs: 9e4 },
  standard_ach: { intervalMs: 3e3, timeoutMs: 9e4 },
  wire: { intervalMs: 5e3, timeoutMs: 18e4 }
};
var DEFAULT_POLLING = { intervalMs: 2e3, timeoutMs: 6e4 };
function payeeNameForTransaction(displayName, simulateFailure) {
  return simulateFailure ? FAILURE_SIMULATION_NAME : displayName;
}

// src/client.ts
var RootApiError = class extends Error {
  status;
  method;
  path;
  /** Parsed JSON body if the response was JSON, otherwise undefined. */
  body;
  /** Raw response text. */
  rawText;
  /** Best-effort error code/key extracted from the response body. */
  code;
  constructor(args) {
    const friendly = extractFriendlyMessage(args.body, args.rawText);
    super(`Root API ${args.method} ${args.path} failed: ${args.status} ${friendly}`);
    this.name = "RootApiError";
    this.status = args.status;
    this.method = args.method;
    this.path = args.path;
    this.rawText = args.rawText;
    this.body = args.body;
    this.code = extractCode(args.body);
  }
};
function extractFriendlyMessage(body, fallback) {
  if (body && typeof body === "object") {
    const b = body;
    if (typeof b.message === "string") return b.message;
    if (typeof b.error === "string") return b.error;
    if (typeof b.detail === "string") return b.detail;
    if (b.errors && typeof b.errors === "object") {
      try {
        return JSON.stringify(b.errors);
      } catch {
      }
    }
  }
  return fallback || "<empty body>";
}
function extractCode(body) {
  if (body && typeof body === "object") {
    const b = body;
    if (typeof b.code === "string") return b.code;
    if (typeof b.error_code === "string") return b.error_code;
  }
  return void 0;
}
function formatQuery(query) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    if (raw === void 0 || raw === null || raw === "") continue;
    if (Array.isArray(raw)) {
      for (const v of raw) {
        if (v !== void 0 && v !== null && v !== "") params.append(key, String(v));
      }
    } else if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
      params.set(key, String(raw));
    } else {
      continue;
    }
  }
  return params.toString();
}
function unwrapSingle(res) {
  if (res && typeof res === "object" && "data" in res && !Array.isArray(res.data)) {
    return res.data;
  }
  return res;
}
var RootClient = class {
  apiKey;
  baseUrl;
  timeoutMs;
  maxRetries;
  fetchImpl;
  onRequest;
  defaultHeaders;
  constructor(opts = {}) {
    const apiKey = sanitizeApiKey(opts.apiKey ?? readEnv("ROOT_API_KEY"));
    if (!apiKey) {
      throw new Error(
        "[root-sandbox-sdk] Missing apiKey. Pass `{ apiKey }` or set ROOT_API_KEY in your server env. NEVER expose this key to the browser."
      );
    }
    if (!opts.allowNonStandardApiKey) {
      const hint = apiKeyFormatHint(apiKey);
      if (hint) {
        throw new Error(`[root-sandbox-sdk] ${hint}`);
      }
    }
    this.apiKey = apiKey;
    this.baseUrl = (opts.baseUrl ?? readEnv("ROOT_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? 3e4;
    this.maxRetries = opts.maxRetries ?? 1;
    const f = opts.fetch ?? globalThis.fetch;
    if (!f) {
      throw new Error(
        "[root-sandbox-sdk] No global `fetch` available. Use Node 18+ or pass `fetch` in options."
      );
    }
    this.fetchImpl = f.bind(globalThis);
    this.onRequest = opts.onRequest;
    this.defaultHeaders = opts.defaultHeaders ?? {};
  }
  /**
   * Low-level request. Returns the parsed JSON body, with the `{ data }`
   * envelope auto-unwrapped for single-object responses. Throws `RootApiError`
   * on any non-2xx response.
   */
  async request(path, opts = {}) {
    const method = opts.method ?? "GET";
    const qs = formatQuery(opts.query);
    const fullPath = qs ? `${path}${path.includes("?") ? "&" : "?"}${qs}` : path;
    const url = `${this.baseUrl}${fullPath}`;
    let attempt = 0;
    let lastError;
    while (attempt <= this.maxRetries) {
      const startedAt = Date.now();
      const ctrl = new AbortController();
      const timeoutMs = opts.timeoutMs ?? this.timeoutMs;
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const externalSignal = opts.signal;
      const onAbort = () => ctrl.abort(externalSignal?.reason);
      if (externalSignal) {
        if (externalSignal.aborted) ctrl.abort(externalSignal.reason);
        else externalSignal.addEventListener("abort", onAbort, { once: true });
      }
      try {
        const res = await this.fetchImpl(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-API-KEY": this.apiKey,
            "User-Agent": "@useroot/sandbox-sdk",
            ...this.defaultHeaders,
            ...opts.headers ?? {}
          },
          body: opts.body === void 0 ? void 0 : JSON.stringify(opts.body),
          cache: "no-store",
          signal: ctrl.signal
        });
        const rawText = res.status === 204 ? "" : await res.text();
        const body = parseJsonSafe(rawText);
        const durationMs = Date.now() - startedAt;
        this.onRequest?.({
          method,
          path: fullPath,
          url,
          status: res.status,
          ok: res.ok,
          startedAt,
          durationMs,
          requestBody: opts.body,
          responseBody: body ?? rawText
        });
        if (!res.ok) {
          if ((res.status >= 500 || res.status === 429) && attempt < this.maxRetries) {
            attempt++;
            await sleep(backoffDelay(attempt));
            continue;
          }
          throw new RootApiError({
            status: res.status,
            method,
            path: fullPath,
            rawText,
            body
          });
        }
        if (res.status === 204) return void 0;
        return unwrapSingle(body);
      } catch (err) {
        lastError = err;
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        const isApiError = err instanceof RootApiError;
        const durationMs = Date.now() - startedAt;
        this.onRequest?.({
          method,
          path: fullPath,
          url,
          status: isApiError ? err.status : 0,
          ok: false,
          startedAt,
          durationMs,
          requestBody: opts.body,
          error: err
        });
        if (!isApiError && !isAbort && attempt < this.maxRetries) {
          attempt++;
          await sleep(backoffDelay(attempt));
          continue;
        }
        throw err;
      } finally {
        clearTimeout(timer);
        if (externalSignal) externalSignal.removeEventListener("abort", onAbort);
      }
    }
    throw lastError ?? new Error("[root-sandbox-sdk] request exhausted retries");
  }
  /** Convenience: GET. */
  get(path, opts = {}) {
    return this.request(path, { ...opts, method: "GET" });
  }
  /** Convenience: POST. */
  post(path, body, opts = {}) {
    return this.request(path, { ...opts, method: "POST", body });
  }
  /** Convenience: PATCH. */
  patch(path, body, opts = {}) {
    return this.request(path, { ...opts, method: "PATCH", body });
  }
  /** Convenience: DELETE. */
  delete(path, opts = {}) {
    return this.request(path, { ...opts, method: "DELETE" });
  }
  /** Read the resolved base URL (mostly useful for logging). */
  get baseUrlOrigin() {
    return this.baseUrl;
  }
};
function readEnv(key) {
  if (typeof process !== "undefined" && process.env) {
    const v = process.env[key];
    if (v && v.length > 0) return v;
  }
  return void 0;
}
function parseJsonSafe(text) {
  if (!text) return void 0;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function backoffDelay(attempt) {
  return Math.min(500 * 2 ** (attempt - 1), 4e3);
}

// src/resources/payees.ts
var PayeesResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /** `POST /api/payees/` */
  create(body) {
    return this.client.post("/api/payees/", body);
  }
  /** `GET /api/payees/{id}` */
  get(payeeId) {
    return this.client.get(`/api/payees/${encodeURIComponent(payeeId)}`);
  }
  /** `GET /api/payees` */
  list(params) {
    return this.client.get("/api/payees", {
      query: params
    });
  }
  /** `PATCH /api/payees/{id}` */
  update(payeeId, body) {
    return this.client.patch(`/api/payees/${encodeURIComponent(payeeId)}`, body);
  }
  /** Convenience: find a payee by exact email match (case-insensitive). */
  async findByEmail(email) {
    const list = await this.list({ email, limit: 5 });
    const lower = email.toLowerCase();
    return list.data?.find((p) => p.email.toLowerCase() === lower) ?? null;
  }
  /**
   * `POST /api/payees/{id}/payment-methods/pay-to-bank`
   *
   * Defaults to a sandbox-allowed test account/routing pair if no body is passed.
   * Pass `account_number` / `routing_number` from `ALLOWED_TEST_*` constants to override.
   */
  attachPayToBank(payeeId, body) {
    return this.client.post(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/pay-to-bank`,
      {
        account_number: body?.account_number ?? DEFAULT_TEST_BANK.account_number,
        routing_number: body?.routing_number ?? DEFAULT_TEST_BANK.routing_number,
        routing_number_type: body?.routing_number_type ?? DEFAULT_TEST_BANK.routing_number_type
      }
    );
  }
  /**
   * `POST /api/payees/{id}/payment-methods/push-to-card`
   *
   * Defaults to a sandbox-allowed Visa test card if no body is passed.
   */
  attachPushToCard(payeeId, body) {
    return this.client.post(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/push-to-card`,
      {
        card_number: body?.card_number ?? DEFAULT_TEST_CARD.card_number,
        card_expiry_date: body?.card_expiry_date ?? DEFAULT_TEST_CARD.card_expiry_date
      }
    );
  }
  /** `GET /api/payees/{id}/payment-methods` */
  listPaymentMethods(payeeId) {
    return this.client.get(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods`
    );
  }
  /** `GET /api/payees/{payee_id}/payment-methods/{pm_id}` */
  getPaymentMethod(payeeId, pmId) {
    return this.client.get(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/${encodeURIComponent(pmId)}`
    );
  }
  /** `POST /api/payees/{payee_id}/payment-methods/{pm_id}/set-default` */
  setDefaultPaymentMethod(payeeId, pmId) {
    return this.client.post(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/${encodeURIComponent(pmId)}/set-default`
    );
  }
  /** `DELETE /api/payees/{payee_id}/payment-methods/{pm_id}` */
  deletePaymentMethod(payeeId, pmId) {
    return this.client.delete(
      `/api/payees/${encodeURIComponent(payeeId)}/payment-methods/${encodeURIComponent(pmId)}`
    );
  }
};

// src/resources/payers.ts
var PayersResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /** `POST /api/payers/` */
  create(body) {
    return this.client.post("/api/payers/", body ?? {});
  }
  /** `GET /api/payers/{id}` */
  get(payerId) {
    return this.client.get(`/api/payers/${encodeURIComponent(payerId)}`);
  }
  /** `GET /api/payers` */
  list(params) {
    return this.client.get("/api/payers", {
      query: params
    });
  }
  /** `PATCH /api/payers/{id}` */
  update(payerId, body) {
    return this.client.patch(`/api/payers/${encodeURIComponent(payerId)}`, body);
  }
  async findByEmail(email) {
    const list = await this.list({ email, limit: 5 });
    const lower = email.toLowerCase();
    return list.data?.find((p) => p.email.toLowerCase() === lower) ?? null;
  }
  /**
   * `POST /api/payers/{id}/payment-methods/pay-by-bank`
   *
   * Defaults to a sandbox-allowed account/routing pair. Note that payers use
   * a different default routing number than payees in the sandbox.
   */
  attachPayByBank(payerId, body, query) {
    const q = { is_default: query?.is_default ?? true };
    if (query?.subaccount_id) q.subaccount_id = query.subaccount_id;
    return this.client.post(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/pay-by-bank`,
      {
        account_number: body?.account_number ?? DEFAULT_TEST_BANK.account_number,
        routing_number: body?.routing_number ?? ALLOWED_TEST_ROUTING_NUMBERS[0],
        routing_number_type: body?.routing_number_type ?? "aba"
      },
      { query: q }
    );
  }
  /** `GET /api/payers/{payer_id}/payment-methods` */
  listPaymentMethods(payerId) {
    return this.client.get(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods`
    );
  }
  /** `GET /api/payers/{payer_id}/payment-methods/{pm_id}` */
  getPaymentMethod(payerId, pmId) {
    return this.client.get(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/${encodeURIComponent(pmId)}`
    );
  }
  /** `GET /api/payers/{payer_id}/payment-methods/default` */
  getDefaultPaymentMethod(payerId) {
    return this.client.get(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/default`
    );
  }
  /** `POST /api/payers/{payer_id}/payment-methods/{pm_id}/set-default` */
  setDefaultPaymentMethod(payerId, pmId) {
    return this.client.post(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/${encodeURIComponent(pmId)}/set-default`
    );
  }
  /** `DELETE /api/payers/{payer_id}/payment-methods/{pm_id}` */
  deletePaymentMethod(payerId, pmId) {
    return this.client.delete(
      `/api/payers/${encodeURIComponent(payerId)}/payment-methods/${encodeURIComponent(pmId)}`
    );
  }
};

// src/status.ts
function statusLabel(status) {
  switch (status) {
    case "created":
    case "approved":
      return "Queued";
    case "initiated":
      return "Sent to bank";
    case "processing":
      return "Processing";
    case "debited":
    case "settled":
      return "Paid";
    case "failed":
      return "Failed";
    case "canceled":
      return "Canceled";
    case "needs_review":
      return "Under review";
    default:
      return status;
  }
}
var TERMINAL_STATUSES = /* @__PURE__ */ new Set([
  "debited",
  "settled",
  "failed",
  "canceled"
]);
function isTerminal(status) {
  return TERMINAL_STATUSES.has(status);
}
function isSuccess(status) {
  return status === "debited" || status === "settled";
}
function terminalForRail(rail, direction = "payout") {
  if (direction === "payin") return "settled";
  if (rail === "standard_ach" || rail === "same_day_ach") return "debited";
  return "settled";
}

// src/poll.ts
var RootPollTimeoutError = class extends Error {
  /** Last snapshot fetched before the timeout fired. */
  lastSnapshot;
  constructor(lastSnapshot, timeoutMs) {
    const status = lastSnapshot && typeof lastSnapshot === "object" ? lastSnapshot.status : void 0;
    super(
      `Polling timed out after ${timeoutMs}ms (last status: ${status ?? "unknown"}).`
    );
    this.name = "RootPollTimeoutError";
    this.lastSnapshot = lastSnapshot;
  }
};
async function waitForTerminal(getter, opts = {}) {
  const policy = opts.rail ? RAIL_POLLING[opts.rail] : void 0;
  const intervalMs = opts.intervalMs ?? policy?.intervalMs ?? DEFAULT_POLLING.intervalMs;
  const timeoutMs = opts.timeoutMs ?? policy?.timeoutMs ?? DEFAULT_POLLING.timeoutMs;
  const isDone = opts.isTerminal ?? ((s) => isTerminal(s.status));
  const deadline = Date.now() + timeoutMs;
  let snapshot = await getter();
  opts.onUpdate?.(snapshot);
  if (isDone(snapshot)) return snapshot;
  while (Date.now() < deadline) {
    if (opts.signal?.aborted) {
      throw new DOMException("Polling aborted", "AbortError");
    }
    await sleep2(intervalMs, opts.signal);
    snapshot = await getter();
    opts.onUpdate?.(snapshot);
    if (isDone(snapshot)) return snapshot;
  }
  throw new RootPollTimeoutError(snapshot, timeoutMs);
}
function sleep2(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Polling aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Polling aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// src/resources/payins.ts
var PayinsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * `POST /api/payins/`
   *
   * Defaults: `rail = 'standard_ach'`, `auto_approve = true`, `currency_code = 'USD'`.
   * Payins only accept ACH rails — passing `instant_bank` / `instant_card` / `wire`
   * will return a 4xx from the API.
   */
  create(body) {
    return this.client.post("/api/payins/", {
      rail: "standard_ach",
      auto_approve: true,
      currency_code: "USD",
      ...body
    });
  }
  /** `GET /api/payins/{id}` */
  get(payinId) {
    return this.client.get(`/api/payins/${encodeURIComponent(payinId)}`);
  }
  /** `GET /api/payins/` */
  list(params) {
    return this.client.get("/api/payins/", {
      query: params
    });
  }
  /** `POST /api/payins/{id}/approve` (only needed when `auto_approve: false`). */
  approve(payinId) {
    return this.client.post(`/api/payins/${encodeURIComponent(payinId)}/approve`);
  }
  /** `DELETE /api/payins/{id}` */
  cancel(payinId) {
    return this.client.delete(`/api/payins/${encodeURIComponent(payinId)}`);
  }
  /** Poll `GET /api/payins/{id}` until terminal. Uses rail-aware defaults. */
  waitForTerminal(payinId, opts) {
    return waitForTerminal(() => this.get(payinId), opts);
  }
};

// src/resources/payouts.ts
var PayoutsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * `POST /api/payouts/`
   *
   * `auto_approve` defaults to `true` so the demo flow advances without a
   * manual approval step. Pass `auto_approve: false` to keep the transfer in
   * `created` until you call an approval API.
   */
  create(body) {
    return this.client.post("/api/payouts/", {
      auto_approve: true,
      currency_code: "USD",
      ...body
    });
  }
  /** `GET /api/payouts/{id}` */
  get(payoutId) {
    return this.client.get(`/api/payouts/${encodeURIComponent(payoutId)}`);
  }
  /** `GET /api/payouts` */
  list(params) {
    return this.client.get("/api/payouts", {
      query: params
    });
  }
  /** `DELETE /api/payouts/{id}` */
  cancel(payoutId) {
    return this.client.delete(`/api/payouts/${encodeURIComponent(payoutId)}`);
  }
  /**
   * Poll `GET /api/payouts/{id}` until it reaches a terminal status
   * (`debited`, `settled`, `failed`, or `canceled`). Uses rail-aware defaults
   * for poll interval and timeout.
   */
  waitForTerminal(payoutId, opts) {
    return waitForTerminal(() => this.get(payoutId), opts);
  }
};

// src/resources/sessionTokens.ts
var SessionTokensResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * `POST /api/session-tokens/party`
   *
   * Mints a short-lived token scoped to a specific payee or payer that can
   * safely be returned to the browser to drive an embedded UI.
   */
  createForParty(body) {
    return this.client.post("/api/session-tokens/party", {
      party_type: "payee",
      ...body
    });
  }
};

// src/resources/subaccounts.ts
var SubaccountsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  cachedDefaultId;
  /** `POST /api/subaccounts/` */
  create(body) {
    return this.client.post("/api/subaccounts/", body);
  }
  /** `GET /api/subaccounts/{id}` */
  get(subaccountId) {
    return this.client.get(`/api/subaccounts/${encodeURIComponent(subaccountId)}`);
  }
  /** `PATCH /api/subaccounts/{id}` */
  update(subaccountId, body) {
    return this.client.patch(
      `/api/subaccounts/${encodeURIComponent(subaccountId)}`,
      body
    );
  }
  /** `GET /api/subaccounts` */
  list(params) {
    return this.client.get("/api/subaccounts", {
      query: params
    });
  }
  /** `POST /api/subaccounts/move` — instant subaccount-to-subaccount transfer. */
  move(body) {
    return this.client.post("/api/subaccounts/move", body);
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
  async getOrCreateDefault(opts) {
    if (this.cachedDefaultId) return this.get(this.cachedDefaultId);
    const envKey = opts?.envVar ?? "ROOT_DEFAULT_SUBACCOUNT_ID";
    const envId = readEnv2(envKey);
    if (envId) {
      this.cachedDefaultId = envId;
      return this.get(envId);
    }
    const list = await this.list({ limit: 1 });
    const first = list.data?.[0];
    if (first) {
      this.cachedDefaultId = first.id;
      return first;
    }
    const created = await this.create({ name: opts?.name ?? "Demo Default" });
    this.cachedDefaultId = created.id;
    return created;
  }
};
function readEnv2(key) {
  if (typeof process !== "undefined" && process.env) {
    const v = process.env[key];
    if (v && v.length > 0) return v;
  }
  return void 0;
}

// src/resources/webhooks.ts
var WebhooksResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * `POST /api/webhooks`
   *
   * The returned `secret_key` is shown ONLY on create — store it (in memory
   * is fine for a demo) for signature verification.
   */
  create(body) {
    return this.client.post("/api/webhooks", body);
  }
  /** `GET /api/webhooks` */
  list() {
    return this.client.get("/api/webhooks");
  }
  /** `GET /api/webhooks/{id}` (does NOT include `secret_key`). */
  get(webhookId) {
    return this.client.get(`/api/webhooks/${encodeURIComponent(webhookId)}`);
  }
  /** `POST /api/webhooks/{id}/toggle` — flips `is_active`. */
  toggle(webhookId) {
    return this.client.post(
      `/api/webhooks/${encodeURIComponent(webhookId)}/toggle`
    );
  }
  /** `DELETE /api/webhooks/{id}` */
  delete(webhookId) {
    return this.client.delete(`/api/webhooks/${encodeURIComponent(webhookId)}`);
  }
};

// src/flows.ts
var Flows = class {
  constructor(payees, payers, payouts, payins, subaccounts) {
    this.payees = payees;
    this.payers = payers;
    this.payouts = payouts;
    this.payins = payins;
    this.subaccounts = subaccounts;
  }
  payees;
  payers;
  payouts;
  payins;
  subaccounts;
  /**
   * One-shot money-out flow:
   *   1. Reuse-or-create the payee (matched by email).
   *   2. Attach a payment method (bank by default; card if `paymentMethod.card` is provided).
   *   3. Resolve the subaccount (uses default if not given).
   *   4. Create the payout with `auto_approve: true`.
   *   5. (optional) Poll until terminal.
   */
  async payTo(input) {
    const displayName = payeeNameForTransaction(
      input.payee.name,
      Boolean(input.simulateFailure)
    );
    const existing = await this.payees.findByEmail(input.payee.email);
    const payee = existing ?? await this.payees.create({
      name: displayName,
      email: input.payee.email,
      metadata: input.payee.metadata
    });
    const payeeForTransfer = existing && existing.name !== displayName ? await this.payees.update(existing.id, { name: displayName }) : payee;
    const paymentMethod = await attachPayeePaymentMethod(
      this.payees,
      payeeForTransfer.id,
      input.paymentMethod
    );
    const subaccountId = input.subaccount_id ?? (await this.subaccounts.getOrCreateDefault()).id;
    const payout = await this.payouts.create({
      payee_id: payeeForTransfer.id,
      amount_in_cents: input.amount_in_cents,
      rail: input.rail,
      subaccount_id: subaccountId,
      auto_approve: true,
      currency_code: input.currency_code ?? "USD",
      metadata: input.metadata
    });
    let finalPayout = payout;
    if (input.waitForTerminal !== false) {
      finalPayout = await this.payouts.waitForTerminal(payout.id, {
        rail: input.rail,
        onUpdate: (snap) => input.onStatus?.(snap.status, snap)
      });
    }
    return { payee: payeeForTransfer, paymentMethod, payout, finalPayout };
  }
  /**
   * One-shot money-in flow:
   *   1. Reuse-or-create the payer.
   *   2. Attach a pay-by-bank method.
   *   3. Resolve the subaccount.
   *   4. Create the payin with `auto_approve: true` (ACH only).
   *   5. (optional) Poll until terminal.
   */
  async chargeFrom(input) {
    const displayName = payeeNameForTransaction(
      input.payer.name,
      Boolean(input.simulateFailure)
    );
    const existing = await this.payers.findByEmail(input.payer.email);
    const payer = existing ?? await this.payers.create({
      name: displayName,
      email: input.payer.email,
      metadata: input.payer.metadata
    });
    const payerForTransfer = existing && existing.name !== displayName ? await this.payers.update(existing.id, { name: displayName }) : payer;
    const paymentMethod = await this.payers.attachPayByBank(
      payerForTransfer.id,
      input.bank,
      { is_default: true }
    );
    const subaccountId = input.subaccount_id ?? (await this.subaccounts.getOrCreateDefault()).id;
    const rail = input.rail ?? "standard_ach";
    const payin = await this.payins.create({
      payer_id: payerForTransfer.id,
      amount_in_cents: input.amount_in_cents,
      rail,
      subaccount_id: subaccountId,
      auto_approve: true,
      currency_code: input.currency_code ?? "USD",
      metadata: input.metadata
    });
    let finalPayin = payin;
    if (input.waitForTerminal !== false) {
      finalPayin = await this.payins.waitForTerminal(payin.id, {
        rail,
        onUpdate: (snap) => input.onStatus?.(snap.status, snap)
      });
    }
    return { payer: payerForTransfer, paymentMethod, payin, finalPayin };
  }
  /**
   * Move funds instantly between two subaccounts (`POST /api/subaccounts/move`).
   */
  async moveBetweenSubaccounts(input) {
    return this.subaccounts.move({
      from_subaccount_id: input.from_subaccount_id,
      to_subaccount_id: input.to_subaccount_id,
      amount_in_cents: input.amount_in_cents
    });
  }
  /**
   * Create a payin (ACH pull) funding `subaccount_id` using the payer's existing bank PM.
   * Mirrors the payin + poll portion of {@link Flows.chargeFrom}.
   */
  async fundSubaccountFromExistingPayer(input) {
    const rail = input.rail;
    const payin = await this.payins.create({
      payer_id: input.payer_id,
      amount_in_cents: input.amount_in_cents,
      rail,
      subaccount_id: input.subaccount_id,
      auto_approve: true,
      currency_code: input.currency_code ?? "USD",
      metadata: input.metadata
    });
    let finalPayin = payin;
    if (input.waitForTerminal !== false) {
      finalPayin = await this.payins.waitForTerminal(payin.id, {
        rail,
        onUpdate: (snap) => input.onStatus?.(snap.status, snap)
      });
    }
    return { payin, finalPayin };
  }
};
async function attachPayeePaymentMethod(payees, payeeId, pm) {
  if (pm && "card" in pm) {
    return payees.attachPushToCard(payeeId, pm.card);
  }
  const bank = pm && "bank" in pm ? pm.bank : void 0;
  return payees.attachPayToBank(payeeId, bank);
}

// src/pagination.ts
async function* paginate(fetcher, initial) {
  let params = initial ?? {};
  while (true) {
    const page = await fetcher(params);
    yield page;
    if (!page.has_more || !page.next_cursor) return;
    params = { ...params, cursor: page.next_cursor };
  }
}
async function collectAll(fetcher, initial) {
  const out = [];
  for await (const page of paginate(fetcher, initial)) {
    if (Array.isArray(page.data)) out.push(...page.data);
  }
  return out;
}

// src/index.ts
var Root = class {
  /** Underlying HTTP client. Use `root.request(...)` for endpoints not yet covered by a resource. */
  client;
  subaccounts;
  payees;
  payers;
  payouts;
  payins;
  webhooks;
  sessionTokens;
  flows;
  constructor(opts = {}) {
    this.client = new RootClient(opts);
    this.subaccounts = new SubaccountsResource(this.client);
    this.payees = new PayeesResource(this.client);
    this.payers = new PayersResource(this.client);
    this.payouts = new PayoutsResource(this.client);
    this.payins = new PayinsResource(this.client);
    this.webhooks = new WebhooksResource(this.client);
    this.sessionTokens = new SessionTokensResource(this.client);
    this.flows = new Flows(
      this.payees,
      this.payers,
      this.payouts,
      this.payins,
      this.subaccounts
    );
  }
  /** Escape hatch for endpoints not yet covered by a resource. */
  request(...args) {
    return this.client.request(...args);
  }
};
function createRoot(opts = {}) {
  return new Root(opts);
}
var index_default = Root;

export { ALLOWED_TEST_ACCOUNT_NUMBERS, ALLOWED_TEST_CARD_NUMBERS, ALLOWED_TEST_ROUTING_NUMBERS, DEFAULT_BASE_URL, DEFAULT_POLLING, DEFAULT_TEST_BANK, DEFAULT_TEST_CARD, FAILURE_SIMULATION_NAME, Flows, PayeesResource, PayersResource, PayinsResource, PayoutsResource, RAIL_POLLING, Root, RootApiError, RootClient, RootPollTimeoutError, SessionTokensResource, SubaccountsResource, TERMINAL_STATUSES, TEST_CARD_EXPIRY, WebhooksResource, apiKeyFormatHint, collectAll, createRoot, index_default as default, describeApiKeyForLogs, isLikelyRootApiToken, isSuccess, isTerminal, paginate, payeeNameForTransaction, sanitizeApiKey, statusLabel, terminalForRail, waitForTerminal };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map