/** Listener invoked once per HTTP call after the response is received. */
type RequestObserver = (event: {
    method: string;
    path: string;
    url: string;
    status: number;
    ok: boolean;
    startedAt: number;
    durationMs: number;
    requestBody?: unknown;
    responseBody?: unknown;
    error?: Error;
}) => void;
interface RootClientOptions {
    /**
     * Root API key. Send via the `X-API-KEY` header. Defaults to
     * `process.env.ROOT_API_KEY`. Required — server-side only, never expose to the browser.
     */
    apiKey?: string;
    /** Override the API host. Defaults to `process.env.ROOT_BASE_URL` or `https://api.useroot.com`. */
    baseUrl?: string;
    /** Per-request timeout in ms (default 30s). */
    timeoutMs?: number;
    /** How many times to retry on network errors and 5xx (default 1). */
    maxRetries?: number;
    /** Custom fetch (mostly for tests). Defaults to global fetch. */
    fetch?: typeof fetch;
    /** Optional observer for every HTTP call — useful for "API timeline" panels. */
    onRequest?: RequestObserver;
    /** Extra headers added to every request. */
    defaultHeaders?: Record<string, string>;
    /**
     * Skip client-side validation that `apiKey` matches `test_<uuid>_<secret>` /
     * `live_<uuid>_<secret>`. The real API still validates; use only for tests
     * or unusual environments.
     */
    allowNonStandardApiKey?: boolean;
}
/**
 * Query parameters. Values may be primitives, arrays of strings, or
 * `null`/`undefined`/`''` (which are skipped). Typed via `unknown` so any
 * caller-side interface (e.g. `ListPayoutsParams`) is accepted without
 * needing an explicit index signature.
 */
type QueryParams = Record<string, unknown>;
interface RequestOptions {
    /** HTTP method. Defaults to GET. */
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    /** Body — will be JSON-stringified. */
    body?: unknown;
    /** Query parameters; falsy values are skipped. Arrays repeat the key. */
    query?: QueryParams;
    /** Per-call header overrides. */
    headers?: Record<string, string>;
    /** Per-call timeout override (ms). */
    timeoutMs?: number;
    /** AbortSignal to cancel the request. */
    signal?: AbortSignal;
}
/** Thrown for any non-2xx Root response. Includes the parsed body and raw text. */
declare class RootApiError extends Error {
    status: number;
    method: string;
    path: string;
    /** Parsed JSON body if the response was JSON, otherwise undefined. */
    body?: unknown;
    /** Raw response text. */
    rawText: string;
    /** Best-effort error code/key extracted from the response body. */
    code?: string;
    constructor(args: {
        status: number;
        method: string;
        path: string;
        rawText: string;
        body?: unknown;
    });
}
declare class RootClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeoutMs;
    private readonly maxRetries;
    private readonly fetchImpl;
    private readonly onRequest?;
    private readonly defaultHeaders;
    constructor(opts?: RootClientOptions);
    /**
     * Low-level request. Returns the parsed JSON body, with the `{ data }`
     * envelope auto-unwrapped for single-object responses. Throws `RootApiError`
     * on any non-2xx response.
     */
    request<T>(path: string, opts?: RequestOptions): Promise<T>;
    /** Convenience: GET. */
    get<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
    /** Convenience: POST. */
    post<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
    /** Convenience: PATCH. */
    patch<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
    /** Convenience: DELETE. */
    delete<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
    /** Read the resolved base URL (mostly useful for logging). */
    get baseUrlOrigin(): string;
}

/**
 * Shared types for the Root sandbox SDK.
 *
 * The Root API wraps single-object responses in `{ data: ... }` and list responses
 * in `{ data: [...], has_more, next_cursor }`. The SDK auto-unwraps `data` for single
 * objects and returns the wrapper as-is for lists (so callers can paginate).
 */
type PayoutRail = 'instant_bank' | 'instant_card' | 'same_day_ach' | 'standard_ach' | 'wire';
type PayinRail = 'standard_ach' | 'same_day_ach';
type TransferStatus = 'created' | 'approved' | 'initiated' | 'processing' | 'debited' | 'settled' | 'failed' | 'canceled' | 'needs_review' | (string & {});
interface ListResponse<T> {
    data: T[];
    has_more?: boolean;
    next_cursor?: string | null;
    previous_cursor?: string | null;
    total_count?: number;
}
interface Subaccount {
    id: string;
    name: string;
    account_number?: string;
    routing_number?: string;
    /** Lifetime incoming totals from Root (`GET /api/subaccounts/{id}`). */
    total_incoming_cents?: number;
    /** Lifetime outgoing totals from Root. */
    total_outgoing_cents?: number;
    created_at?: string;
    updated_at?: string;
}
interface Payee {
    id: string;
    name: string;
    email: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}
interface Payer {
    id: string;
    name: string;
    email: string;
    client_metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}
interface PayeePaymentMethod {
    id: string;
    payee_id: string;
    account_last_four?: string;
    routing_number?: string;
    card_last_four?: string;
    card_brand?: string;
    verification_status?: string;
    is_default?: boolean;
    supported_rails?: PayoutRail[];
    created_at?: string;
    updated_at?: string;
}
interface PayerPaymentMethod {
    id: string;
    payer_id: string;
    account_last_four?: string;
    routing_number?: string;
    verification_status?: string;
    is_default?: boolean;
    supported_rails?: PayinRail[];
    created_at?: string;
    updated_at?: string;
}
interface Payout {
    id: string;
    payee_id: string;
    amount_in_cents: number;
    currency_code: string;
    status: TransferStatus;
    rail?: PayoutRail;
    subaccount_id?: string;
    client_metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}
interface Payin {
    id: string;
    payer_id: string;
    amount_in_cents: number;
    currency_code: string;
    rail: PayinRail;
    status: TransferStatus;
    status_recorded_at?: string;
    subaccount_id?: string;
    payin_metadata?: Record<string, unknown>;
    client_metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}
interface SubaccountMove {
    id: string;
    from_subaccount_id: string;
    to_subaccount_id: string;
    amount_in_cents: number;
    created_at?: string;
    updated_at?: string;
}
interface Webhook {
    id: string;
    url: string;
    description?: string;
    is_active: boolean;
    /** Returned only on create. */
    secret_key?: string;
    created_at?: string;
    updated_at?: string;
}
interface PartySessionToken {
    token: string;
    expires_in_seconds: number;
    scopes?: string[];
}

interface ListPayeesParams {
    name?: string;
    email?: string;
    has_default?: boolean;
    limit?: number;
    cursor?: string;
}
interface CreatePayeeBody {
    name: string;
    email: string;
    metadata?: Record<string, unknown>;
}
interface UpdatePayeeBody {
    name?: string;
    email?: string;
    metadata?: Record<string, unknown>;
}
interface AttachPayToBankBody {
    account_number?: string;
    routing_number?: string;
    routing_number_type?: string;
}
interface AttachPushToCardBody {
    card_number?: string;
    card_expiry_date?: string;
}
declare class PayeesResource {
    private readonly client;
    constructor(client: RootClient);
    /** `POST /api/payees/` */
    create(body: CreatePayeeBody): Promise<Payee>;
    /** `GET /api/payees/{id}` */
    get(payeeId: string): Promise<Payee>;
    /** `GET /api/payees` */
    list(params?: ListPayeesParams): Promise<ListResponse<Payee>>;
    /** `PATCH /api/payees/{id}` */
    update(payeeId: string, body: UpdatePayeeBody): Promise<Payee>;
    /** Convenience: find a payee by exact email match (case-insensitive). Uses {@link ROOT_LIST_BY_EMAIL_MIN_LIMIT} for list queries. */
    findByEmail(email: string): Promise<Payee | null>;
    /**
     * `POST /api/payees/{id}/payment-methods/pay-to-bank`
     *
     * Defaults to a sandbox-allowed test account/routing pair if no body is passed.
     * Pass `account_number` / `routing_number` from `ALLOWED_TEST_*` constants to override.
     */
    attachPayToBank(payeeId: string, body?: AttachPayToBankBody): Promise<PayeePaymentMethod>;
    /**
     * `POST /api/payees/{id}/payment-methods/push-to-card`
     *
     * Defaults to a sandbox-allowed Visa test card if no body is passed.
     */
    attachPushToCard(payeeId: string, body?: AttachPushToCardBody): Promise<PayeePaymentMethod>;
    /** `GET /api/payees/{id}/payment-methods` */
    listPaymentMethods(payeeId: string): Promise<ListResponse<PayeePaymentMethod>>;
    /** `GET /api/payees/{payee_id}/payment-methods/{pm_id}` */
    getPaymentMethod(payeeId: string, pmId: string): Promise<PayeePaymentMethod>;
    /** `POST /api/payees/{payee_id}/payment-methods/{pm_id}/set-default` */
    setDefaultPaymentMethod(payeeId: string, pmId: string): Promise<PayeePaymentMethod>;
    /** `DELETE /api/payees/{payee_id}/payment-methods/{pm_id}` */
    deletePaymentMethod(payeeId: string, pmId: string): Promise<void>;
}

interface ListPayersParams {
    name?: string;
    email?: string;
    has_default?: boolean;
    limit?: number;
    cursor?: string;
}
interface CreatePayerBody {
    name?: string;
    email?: string;
    metadata?: Record<string, unknown>;
}
interface UpdatePayerBody {
    name?: string;
    email?: string;
    metadata?: Record<string, unknown>;
}
interface AttachPayByBankBody {
    account_number?: string;
    routing_number?: string;
    routing_number_type?: string;
}
/** Query params for `attachPayByBank`. */
interface AttachPayByBankQuery {
    is_default?: boolean;
    /** Associate the payment method with this subaccount when supported by the API. */
    subaccount_id?: string;
}
declare class PayersResource {
    private readonly client;
    constructor(client: RootClient);
    /** `POST /api/payers/` */
    create(body?: CreatePayerBody): Promise<Payer>;
    /** `GET /api/payers/{id}` */
    get(payerId: string): Promise<Payer>;
    /** `GET /api/payers` */
    list(params?: ListPayersParams): Promise<ListResponse<Payer>>;
    /** `PATCH /api/payers/{id}` */
    update(payerId: string, body: UpdatePayerBody): Promise<Payer>;
    /** Convenience: find payer by email (case-insensitive). Uses {@link ROOT_LIST_BY_EMAIL_MIN_LIMIT} for list queries. */
    findByEmail(email: string): Promise<Payer | null>;
    /**
     * `POST /api/payers/{id}/payment-methods/pay-by-bank`
     *
     * Defaults to a sandbox-allowed account/routing pair. Note that payers use
     * a different default routing number than payees in the sandbox.
     */
    attachPayByBank(payerId: string, body?: AttachPayByBankBody, query?: AttachPayByBankQuery): Promise<PayerPaymentMethod>;
    /** `GET /api/payers/{payer_id}/payment-methods` */
    listPaymentMethods(payerId: string): Promise<ListResponse<PayerPaymentMethod>>;
    /** `GET /api/payers/{payer_id}/payment-methods/{pm_id}` */
    getPaymentMethod(payerId: string, pmId: string): Promise<PayerPaymentMethod>;
    /** `GET /api/payers/{payer_id}/payment-methods/default` */
    getDefaultPaymentMethod(payerId: string): Promise<PayerPaymentMethod>;
    /** `POST /api/payers/{payer_id}/payment-methods/{pm_id}/set-default` */
    setDefaultPaymentMethod(payerId: string, pmId: string): Promise<PayerPaymentMethod>;
    /** `DELETE /api/payers/{payer_id}/payment-methods/{pm_id}` */
    deletePaymentMethod(payerId: string, pmId: string): Promise<void>;
}

interface WaitForTerminalOptions<T> {
    /**
     * Rail of the transfer. Drives the default poll interval/timeout.
     * If omitted, the SDK uses a 2s × 60s fallback.
     */
    rail?: PayoutRail | PayinRail;
    /** Override the per-poll interval (ms). */
    intervalMs?: number;
    /** Absolute timeout (ms) before throwing `RootPollTimeoutError`. */
    timeoutMs?: number;
    /** Called on every poll with the latest snapshot. */
    onUpdate?: (snapshot: T) => void;
    /** Cancel polling externally. */
    signal?: AbortSignal;
    /**
     * Custom terminal predicate. By default any of `settled`, `debited`,
     * `failed`, `canceled` is treated as terminal.
     */
    isTerminal?: (snapshot: T) => boolean;
}
declare class RootPollTimeoutError extends Error {
    /** Last snapshot fetched before the timeout fired. */
    lastSnapshot: unknown;
    constructor(lastSnapshot: unknown, timeoutMs: number);
}
/**
 * Poll `getter()` until the snapshot reaches a terminal status (or the
 * provided custom predicate returns true). Resolves to the final snapshot.
 *
 * Generic enough to use with payouts, payins, or any object with a `status` field.
 */
declare function waitForTerminal<T extends {
    status: TransferStatus;
}>(getter: () => Promise<T>, opts?: WaitForTerminalOptions<T>): Promise<T>;

interface CreatePayinBody {
    payer_id: string;
    amount_in_cents: number;
    /** Payins only support ACH rails. */
    rail?: PayinRail;
    subaccount_id?: string;
    /** Defaults to `true` for demo deterministic flow. */
    auto_approve?: boolean;
    currency_code?: string;
    metadata?: Record<string, unknown>;
}
interface ListPayinsParams {
    payer_name?: string;
    amount_gte?: number;
    amount_lte?: number;
    created_at_gte?: string;
    created_at_lte?: string;
    rail?: PayinRail;
    status?: string;
    limit?: number;
    cursor?: string;
    subaccount_id?: string;
}
declare class PayinsResource {
    private readonly client;
    constructor(client: RootClient);
    /**
     * `POST /api/payins/`
     *
     * Defaults: `rail = 'standard_ach'`, `auto_approve = true`, `currency_code = 'USD'`.
     * Payins only accept ACH rails — passing `instant_bank` / `instant_card` / `wire`
     * will return a 4xx from the API.
     */
    create(body: CreatePayinBody): Promise<Payin>;
    /** `GET /api/payins/{id}` */
    get(payinId: string): Promise<Payin>;
    /** `GET /api/payins/` */
    list(params?: ListPayinsParams): Promise<ListResponse<Payin>>;
    /** `POST /api/payins/{id}/approve` (only needed when `auto_approve: false`). */
    approve(payinId: string): Promise<Payin>;
    /** `DELETE /api/payins/{id}` */
    cancel(payinId: string): Promise<void>;
    /** Poll `GET /api/payins/{id}` until terminal. Uses rail-aware defaults. */
    waitForTerminal(payinId: string, opts?: Omit<WaitForTerminalOptions<Payin>, 'isTerminal'>): Promise<Payin>;
}

interface CreatePayoutBody {
    payee_id: string;
    amount_in_cents: number;
    rail: PayoutRail;
    subaccount_id?: string;
    /** Defaults to `true` for demo deterministic flow (skips manual approval). */
    auto_approve?: boolean;
    currency_code?: string;
    metadata?: Record<string, unknown>;
}
interface ListPayoutsParams {
    rail?: PayoutRail;
    status?: string;
    amount_gte?: number;
    amount_lte?: number;
    payee_name?: string;
    limit?: number;
    cursor?: string;
    subaccount_id?: string;
}
declare class PayoutsResource {
    private readonly client;
    constructor(client: RootClient);
    /**
     * `POST /api/payouts/`
     *
     * `auto_approve` defaults to `true` so the demo flow advances without a
     * manual approval step. Pass `auto_approve: false` to keep the transfer in
     * `created` until you call an approval API.
     */
    create(body: CreatePayoutBody): Promise<Payout>;
    /** `GET /api/payouts/{id}` */
    get(payoutId: string): Promise<Payout>;
    /** `GET /api/payouts` */
    list(params?: ListPayoutsParams): Promise<ListResponse<Payout>>;
    /** `DELETE /api/payouts/{id}` */
    cancel(payoutId: string): Promise<void>;
    /**
     * Poll `GET /api/payouts/{id}` until it reaches a terminal status
     * (`debited`, `settled`, `failed`, or `canceled`). Uses rail-aware defaults
     * for poll interval and timeout.
     */
    waitForTerminal(payoutId: string, opts?: Omit<WaitForTerminalOptions<Payout>, 'isTerminal'>): Promise<Payout>;
}

declare class SessionTokensResource {
    private readonly client;
    constructor(client: RootClient);
    /**
     * `POST /api/session-tokens/party`
     *
     * Mints a short-lived token scoped to a specific payee or payer that can
     * safely be returned to the browser to drive an embedded UI.
     */
    createForParty(body: {
        party_id: string;
        party_type?: 'payee' | 'payer';
    }): Promise<PartySessionToken>;
}

interface ListSubaccountsParams {
    parent_account_id?: string;
    bank_config_id?: string[];
    cursor?: string;
    limit?: number;
    order?: 'asc' | 'desc';
}
declare class SubaccountsResource {
    private readonly client;
    private cachedDefaultId;
    constructor(client: RootClient);
    /** `POST /api/subaccounts/` */
    create(body: {
        name: string;
    }): Promise<Subaccount>;
    /** `GET /api/subaccounts/{id}` */
    get(subaccountId: string): Promise<Subaccount>;
    /** `PATCH /api/subaccounts/{id}` */
    update(subaccountId: string, body: {
        name: string;
    }): Promise<Subaccount>;
    /** `GET /api/subaccounts` */
    list(params?: ListSubaccountsParams): Promise<ListResponse<Subaccount>>;
    /** `POST /api/subaccounts/move` — instant subaccount-to-subaccount transfer. */
    move(body: {
        from_subaccount_id: string;
        to_subaccount_id: string;
        amount_in_cents: number;
    }): Promise<SubaccountMove>;
    /**
     * Demo helper: return a stable subaccount id for the demo to use, in this priority:
     *
     * 1. `process.env.ROOT_DEFAULT_SUBACCOUNT_ID` if set
     * 2. The first subaccount listed under the entity
     * 3. A freshly created subaccount with the given name (default `Demo Default`)
     *
     * Subsequent calls in the same process are memoized.
     */
    getOrCreateDefault(opts?: {
        name?: string;
        envVar?: string;
    }): Promise<Subaccount>;
}

declare class WebhooksResource {
    private readonly client;
    constructor(client: RootClient);
    /**
     * `POST /api/webhooks`
     *
     * The returned `secret_key` is shown ONLY on create — store it (in memory
     * is fine for a demo) for signature verification.
     */
    create(body: {
        url: string;
        description?: string;
    }): Promise<Webhook>;
    /** `GET /api/webhooks` */
    list(): Promise<ListResponse<Webhook>>;
    /** `GET /api/webhooks/{id}` (does NOT include `secret_key`). */
    get(webhookId: string): Promise<Webhook>;
    /** `POST /api/webhooks/{id}/toggle` — flips `is_active`. */
    toggle(webhookId: string): Promise<Webhook>;
    /** `DELETE /api/webhooks/{id}` */
    delete(webhookId: string): Promise<void>;
}

/**
 * High-level orchestrators for the most common demo flows.
 *
 * These exist so a v0-generated app can do the full money-out / money-in
 * dance in a single call rather than wiring 4–5 sequential API requests
 * in user-space code (which is where the AI tends to get lost).
 */

interface PayToInput {
    /** Payee details. If `name` matches an existing payee email, the existing record is reused. */
    payee: {
        name: string;
        email: string;
        metadata?: Record<string, unknown>;
    };
    amount_in_cents: number;
    rail: PayoutRail;
    /** Payment method. Provide `bank` OR `card`. Defaults to a sandbox-allowed test bank. */
    paymentMethod?: {
        bank: {
            account_number?: string;
            routing_number?: string;
            routing_number_type?: string;
        };
    } | {
        card: {
            card_number?: string;
            card_expiry_date?: string;
        };
    };
    /** Subaccount the payout draws from. If omitted, the SDK uses `subaccounts.getOrCreateDefault()`. */
    subaccount_id?: string;
    /** Currency. Defaults to `USD`. */
    currency_code?: string;
    /** Arbitrary metadata stored on the payout. */
    metadata?: Record<string, unknown>;
    /** When `true`, replaces the payee name with `John Failed` for this transfer. */
    simulateFailure?: boolean;
    /**
     * If `true`, the flow polls until the payout reaches a terminal status
     * before resolving. Default `true`.
     */
    waitForTerminal?: boolean;
    /** Called for each status update during polling. */
    onStatus?: (status: TransferStatus, payout: Payout) => void;
}
interface PayToResult {
    payee: Payee;
    paymentMethod: PayeePaymentMethod;
    payout: Payout;
    /** Final payout snapshot after polling. Same as `payout` if `waitForTerminal: false`. */
    finalPayout: Payout;
}
interface ChargeFromInput {
    /** Payer details. */
    payer: {
        name: string;
        email: string;
        metadata?: Record<string, unknown>;
    };
    amount_in_cents: number;
    /** ACH only. Defaults to `standard_ach`. */
    rail?: PayinRail;
    /** Pay-by-bank account. Defaults to a sandbox-allowed test bank. */
    bank?: {
        account_number?: string;
        routing_number?: string;
        routing_number_type?: string;
    };
    subaccount_id?: string;
    currency_code?: string;
    metadata?: Record<string, unknown>;
    simulateFailure?: boolean;
    waitForTerminal?: boolean;
    onStatus?: (status: TransferStatus, payin: Payin) => void;
}
interface ChargeFromResult {
    payer: Payer;
    paymentMethod: PayerPaymentMethod;
    payin: Payin;
    finalPayin: Payin;
}
/** Instant move between two subaccounts (same entity). */
interface MoveBetweenSubaccountsInput {
    from_subaccount_id: string;
    to_subaccount_id: string;
    amount_in_cents: number;
}
/**
 * ACH pull from an existing payer's linked pay-by-bank method into a subaccount.
 * Preconditions: Root payer exists and has a default (or usable) pay-by-bank PM attached.
 * Does not create payers or attach banks — use {@link Flows.chargeFrom} for full onboarding.
 */
interface FundSubaccountFromExistingPayerInput {
    payer_id: string;
    amount_in_cents: number;
    rail: PayinRail;
    subaccount_id: string;
    currency_code?: string;
    metadata?: Record<string, unknown>;
    /**
     * If `true`, polls until the payin reaches a terminal status. Default `true`.
     */
    waitForTerminal?: boolean;
    onStatus?: (status: TransferStatus, payin: Payin) => void;
}
interface FundSubaccountFromExistingPayerResult {
    payin: Payin;
    /** Snapshot after polling when `waitForTerminal` is not `false`. */
    finalPayin: Payin;
}
declare class Flows {
    private readonly payees;
    private readonly payers;
    private readonly payouts;
    private readonly payins;
    private readonly subaccounts;
    constructor(payees: PayeesResource, payers: PayersResource, payouts: PayoutsResource, payins: PayinsResource, subaccounts: SubaccountsResource);
    /**
     * One-shot money-out flow:
     *   1. Reuse-or-create the payee (matched by email).
     *   2. Attach a payment method (bank by default; card if `paymentMethod.card` is provided).
     *   3. Resolve the subaccount (uses default if not given).
     *   4. Create the payout with `auto_approve: true`.
     *   5. (optional) Poll until terminal.
     */
    payTo(input: PayToInput): Promise<PayToResult>;
    /**
     * One-shot money-in flow:
     *   1. Reuse-or-create the payer.
     *   2. Attach a pay-by-bank method.
     *   3. Resolve the subaccount.
     *   4. Create the payin with `auto_approve: true` (ACH only).
     *   5. (optional) Poll until terminal.
     */
    chargeFrom(input: ChargeFromInput): Promise<ChargeFromResult>;
    /**
     * Move funds instantly between two subaccounts (`POST /api/subaccounts/move`).
     */
    moveBetweenSubaccounts(input: MoveBetweenSubaccountsInput): Promise<SubaccountMove>;
    /**
     * Create a payin (ACH pull) funding `subaccount_id` using the payer's existing bank PM.
     * Mirrors the payin + poll portion of {@link Flows.chargeFrom}.
     */
    fundSubaccountFromExistingPayer(input: FundSubaccountFromExistingPayerInput): Promise<FundSubaccountFromExistingPayerResult>;
}

/**
 * Root API tokens are opaque strings with a fixed shape enforced by the backend:
 *   `test_<token_id>_<secret>` or `live_<token_id>_<secret>`
 * where `<token_id>` is a UUID. This is the `token_value` from API token provisioning —
 * not a bare UUID, not `client_id` / `client_secret` alone.
 *
 * @see backend/core/security/api_token_auth.py — verify_api_token
 */
declare function sanitizeApiKey(raw: string | undefined | null): string;
/** True if the string matches the full `test_|live_<uuid>_<secret>` shape. */
declare function isLikelyRootApiToken(key: string): boolean;
/**
 * If the key is non-empty but not a plausible Root API token, returns a short
 * human-readable hint. Otherwise `null`.
 */
declare function apiKeyFormatHint(key: string): string | null;
/** For logs only — never log the full key. */
declare function describeApiKeyForLogs(key: string): string;

/** Default base URL. Sandbox and live share this host; the API key decides the mode. */
declare const DEFAULT_BASE_URL = "https://api.useroot.com";
/** Minimum `limit` for `GET /api/payers` and `GET /api/payees` when using email filter (Root validates `>= 10`). */
declare const ROOT_LIST_BY_EMAIL_MIN_LIMIT = 10;
/**
 * The single magic name that forces a sandbox transfer to fail.
 * Use `payeeNameForTransaction(name, simulateFailure)` to swap it in.
 */
declare const FAILURE_SIMULATION_NAME = "John Failed";
/** Allowed test US bank account numbers. Random numbers are rejected by sandbox. */
declare const ALLOWED_TEST_ACCOUNT_NUMBERS: readonly ["1234567890", "9999999999", "0000123456", "1111222233"];
/** Allowed test ABA routing numbers. Random numbers are rejected by sandbox. */
declare const ALLOWED_TEST_ROUTING_NUMBERS: readonly ["111000025", "021000021", "011401533", "091000022"];
/** Allowed test card numbers (Visa, Mastercard, Amex, Discover). */
declare const ALLOWED_TEST_CARD_NUMBERS: readonly ["4111111111111111", "5555555555554444", "378282246310005", "6011111111111117"];
/** YYMM expiry; '6608' = August 2066. */
declare const TEST_CARD_EXPIRY = "6608";
/**
 * A safe default test bank pair. Use these in `attachPayToBank` /
 * `attachPayByBank` if the caller has no preference.
 */
declare const DEFAULT_TEST_BANK: {
    account_number: "1234567890";
    routing_number: "021000021";
    routing_number_type: "aba";
};
/** Default test card. Use these in `attachPushToCard` if the caller has no preference. */
declare const DEFAULT_TEST_CARD: {
    card_number: "4111111111111111";
    card_expiry_date: string;
};
/**
 * Per-rail polling defaults derived from the Root sandbox simulation timings.
 * `intervalMs` is the wait between `GET /api/payouts/{id}` (or payin) calls;
 * `timeoutMs` is the absolute cap for waiting for a terminal status.
 */
declare const RAIL_POLLING: Record<PayoutRail, {
    intervalMs: number;
    timeoutMs: number;
}>;
/** Generic fallback when rail is unknown. */
declare const DEFAULT_POLLING: {
    intervalMs: number;
    timeoutMs: number;
};
/**
 * Helper to swap in the failure-simulation name for a single transfer
 * without changing the caller's display name elsewhere.
 */
declare function payeeNameForTransaction(displayName: string, simulateFailure: boolean): string;

/**
 * Map a raw Root status to a friendly UI label.
 *
 * Use `statusLabel(payout.status)` directly in JSX; it returns one of:
 * `Queued`, `Sent to bank`, `Processing`, `Paid`, `Failed`, `Canceled`,
 * `Under review`, or the raw status as a fallback.
 */
declare function statusLabel(status: string): string;
/** Statuses a transfer cannot move out of. Useful as a poller stop condition. */
declare const TERMINAL_STATUSES: Set<TransferStatus>;
declare function isTerminal(status: string): boolean;
/** True only for the success terminals (`settled` or `debited`). */
declare function isSuccess(status: string): boolean;
/**
 * Returns the success terminal for a given rail/direction.
 *
 * - ACH payouts complete with `debited`.
 * - Everything else completes with `settled`.
 */
declare function terminalForRail(rail: PayoutRail | PayinRail, direction?: 'payout' | 'payin'): 'settled' | 'debited';

interface PaginationParams {
    cursor?: string;
    limit?: number;
}
/**
 * Async-iterate every page of a cursor-paginated list endpoint.
 *
 * ```ts
 * for await (const page of paginate(p => root.payouts.list({ ...p, status: 'failed' }))) {
 *   for (const payout of page.data) { ... }
 * }
 * ```
 */
declare function paginate<T, P extends PaginationParams>(fetcher: (params: P) => Promise<ListResponse<T>>, initial?: P): AsyncGenerator<ListResponse<T>, void, void>;
/**
 * Convenience: collect every page into a single flat array. Use only when
 * the result set is bounded (e.g. < a few hundred items).
 */
declare function collectAll<T, P extends PaginationParams>(fetcher: (params: P) => Promise<ListResponse<T>>, initial?: P): Promise<T[]>;

/**
 * @useroot/sandbox-sdk — tiny deterministic SDK for the Root sandbox APIs.
 *
 * Designed for v0-generated demo apps:
 *  - One auth path (`X-API-KEY` from env), one base URL, one error class.
 *  - Resource methods that auto-unwrap the `{ data }` envelope.
 *  - Per-rail polling helper (`waitForTerminal`) with sensible defaults.
 *  - Sandbox-allowed test bank/card/routing numbers baked in as constants.
 *  - High-level flows (`flows.payTo`, `flows.chargeFrom`,
 *    `flows.moveBetweenSubaccounts`, `flows.fundSubaccountFromExistingPayer`) for orchestrated demos.
 */

declare class Root {
    /** Underlying HTTP client. Use `root.request(...)` for endpoints not yet covered by a resource. */
    readonly client: RootClient;
    readonly subaccounts: SubaccountsResource;
    readonly payees: PayeesResource;
    readonly payers: PayersResource;
    readonly payouts: PayoutsResource;
    readonly payins: PayinsResource;
    readonly webhooks: WebhooksResource;
    readonly sessionTokens: SessionTokensResource;
    readonly flows: Flows;
    constructor(opts?: RootClientOptions);
    /** Escape hatch for endpoints not yet covered by a resource. */
    request<T>(...args: Parameters<RootClient['request']>): Promise<T>;
}
/** Functional alias if you prefer `createRoot()` over `new Root()`. */
declare function createRoot(opts?: RootClientOptions): Root;

export { ALLOWED_TEST_ACCOUNT_NUMBERS, ALLOWED_TEST_CARD_NUMBERS, ALLOWED_TEST_ROUTING_NUMBERS, type AttachPayByBankBody, type AttachPayByBankQuery, type AttachPayToBankBody, type AttachPushToCardBody, type ChargeFromInput, type ChargeFromResult, type CreatePayeeBody, type CreatePayerBody, type CreatePayinBody, type CreatePayoutBody, DEFAULT_BASE_URL, DEFAULT_POLLING, DEFAULT_TEST_BANK, DEFAULT_TEST_CARD, FAILURE_SIMULATION_NAME, Flows, type FundSubaccountFromExistingPayerInput, type FundSubaccountFromExistingPayerResult, type ListPayeesParams, type ListPayersParams, type ListPayinsParams, type ListPayoutsParams, type ListResponse, type ListSubaccountsParams, type MoveBetweenSubaccountsInput, type PaginationParams, type PartySessionToken, type PayToInput, type PayToResult, type Payee, type PayeePaymentMethod, PayeesResource, type Payer, type PayerPaymentMethod, PayersResource, type Payin, type PayinRail, PayinsResource, type Payout, type PayoutRail, PayoutsResource, type QueryParams, RAIL_POLLING, ROOT_LIST_BY_EMAIL_MIN_LIMIT, type RequestObserver, type RequestOptions, Root, RootApiError, RootClient, type RootClientOptions, RootPollTimeoutError, SessionTokensResource, type Subaccount, type SubaccountMove, SubaccountsResource, TERMINAL_STATUSES, TEST_CARD_EXPIRY, type TransferStatus, type UpdatePayeeBody, type UpdatePayerBody, type WaitForTerminalOptions, type Webhook, WebhooksResource, apiKeyFormatHint, collectAll, createRoot, Root as default, describeApiKeyForLogs, isLikelyRootApiToken, isSuccess, isTerminal, paginate, payeeNameForTransaction, sanitizeApiKey, statusLabel, terminalForRail, waitForTerminal };
