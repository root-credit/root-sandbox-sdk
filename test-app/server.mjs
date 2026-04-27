/**
 * Minimal local UI to exercise @useroot/sandbox-sdk against sandbox.
 *
 * Run from package root (after `pnpm build`):
 *   pnpm test-app
 *
 * Env: copy test-app/.env.example → test-app/.env (or use repo-root .env).
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import express from 'express'

import {
  Root,
  RootApiError,
  apiKeyFormatHint,
  describeApiKeyForLogs,
  sanitizeApiKey,
} from '../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const PORT = Number(process.env.TEST_APP_PORT ?? process.env.PORT ?? 3847)

/** Remember last IDs so you can chain actions without re-pasting. */
const state = {
  subaccountId: null,
  payeeId: null,
  payerId: null,
  payoutId: null,
  payinId: null,
}

const debugRequests = process.env.ROOT_SDK_DEBUG === '1'

let rootSingleton = null
function getRoot() {
  if (!rootSingleton) {
    rootSingleton = new Root({
      onRequest: debugRequests
        ? ({ method, path, status, durationMs, ok }) => {
            // eslint-disable-next-line no-console
            console.log(
              `[root-sdk] ${method} ${path} → ${status} ${ok ? 'OK' : 'ERR'} (${durationMs}ms)`,
            )
          }
        : undefined,
    })
  }
  return rootSingleton
}

const app = express()
app.use(express.json({ limit: '1mb' }))
app.use(express.static(path.join(__dirname, 'public')))

function asyncRoute(handler) {
  return async (req, res) => {
    try {
      const payload = await handler(req, getRoot())
      res.json({ ok: true, state: { ...state }, ...payload })
    } catch (err) {
      if (err instanceof RootApiError) {
        res.status(err.status >= 400 && err.status < 600 ? err.status : 502).json({
          ok: false,
          error: err.message,
          status: err.status,
          code: err.code,
          body: err.body,
          state: { ...state },
        })
        return
      }
      res.status(500).json({
        ok: false,
        error: err?.message ?? String(err),
        state: { ...state },
      })
    }
  }
}

// ── Meta ───────────────────────────────────────────────────────────────────

app.get(
  '/api/health',
  asyncRoute(() => ({
    hasApiKey: Boolean(process.env.ROOT_API_KEY),
    baseUrl: process.env.ROOT_BASE_URL ?? 'https://api.useroot.com (default)',
  })),
)

// ── Subaccounts ──────────────────────────────────────────────────────────────

app.post(
  '/api/subaccount/create',
  asyncRoute(async (req, r) => {
    const name = String(req.body?.name ?? 'Test Subaccount')
    const sub = await r.subaccounts.create({ name })
    state.subaccountId = sub.id
    return { data: sub }
  }),
)

app.post(
  '/api/subaccount/default',
  asyncRoute(async (req, r) => {
    const name = req.body?.name ? String(req.body.name) : undefined
    const sub = await r.subaccounts.getOrCreateDefault(name ? { name } : {})
    state.subaccountId = sub.id
    return { data: sub }
  }),
)

app.get(
  '/api/subaccounts',
  asyncRoute(async (_req, r) => {
    const list = await r.subaccounts.list({ limit: 20 })
    return { data: list }
  }),
)

// ── Payees ───────────────────────────────────────────────────────────────────

app.post(
  '/api/payee/create',
  asyncRoute(async (req, r) => {
    const name = String(req.body?.name ?? 'Demo Payee')
    const email = String(req.body?.email ?? `payee+${Date.now()}@example.com`)
    const payee = await r.payees.create({ name, email })
    state.payeeId = payee.id
    return { data: payee }
  }),
)

app.post(
  '/api/payee/bank',
  asyncRoute(async (req, r) => {
    const payeeId = String(req.body?.payeeId ?? state.payeeId ?? '')
    if (!payeeId) throw new Error('No payeeId — create a payee first or pass payeeId in the body.')
    const pm = await r.payees.attachPayToBank(payeeId)
    return { data: pm }
  }),
)

app.get(
  '/api/payees',
  asyncRoute(async (_req, r) => {
    const list = await r.payees.list({ limit: 20 })
    return { data: list }
  }),
)

// ── Payouts ──────────────────────────────────────────────────────────────────

app.post(
  '/api/payout/create',
  asyncRoute(async (req, r) => {
    const payeeId = String(req.body?.payeeId ?? state.payeeId ?? '')
    if (!payeeId) throw new Error('No payeeId — create a payee first.')
    const amount_in_cents = Number(req.body?.amount_in_cents ?? 1000)
    const rail = String(req.body?.rail ?? 'instant_bank')
    const subaccount_id = req.body?.subaccount_id
      ? String(req.body.subaccount_id)
      : state.subaccountId ?? (await r.subaccounts.getOrCreateDefault()).id
    if (!state.subaccountId) state.subaccountId = subaccount_id
    const payout = await r.payouts.create({
      payee_id: payeeId,
      amount_in_cents,
      rail,
      subaccount_id,
    })
    state.payoutId = payout.id
    return { data: payout }
  }),
)

app.get(
  '/api/payout/last',
  asyncRoute(async (_req, r) => {
    const id = state.payoutId
    if (!id) throw new Error('No payout id yet — create a payout first.')
    const payout = await r.payouts.get(id)
    return { data: payout }
  }),
)

app.get(
  '/api/payout/:id',
  asyncRoute(async (req, r) => {
    const id = String(req.params.id ?? '')
    if (!id || id === 'last') throw new Error('No payout id.')
    const payout = await r.payouts.get(id)
    return { data: payout }
  }),
)

app.post(
  '/api/payout/poll',
  asyncRoute(async (req, r) => {
    const id = String(req.body?.payoutId ?? state.payoutId ?? '')
    if (!id) throw new Error('No payoutId — create a payout first.')
    const rail = String(req.body?.rail ?? 'instant_bank')
    const final = await r.payouts.waitForTerminal(id, { rail })
    return { data: final }
  }),
)

// ── Payers & payins ──────────────────────────────────────────────────────────

app.post(
  '/api/payer/create',
  asyncRoute(async (req, r) => {
    const name = String(req.body?.name ?? 'Demo Payer')
    const email = String(req.body?.email ?? `payer+${Date.now()}@example.com`)
    const payer = await r.payers.create({ name, email })
    state.payerId = payer.id
    return { data: payer }
  }),
)

app.post(
  '/api/payer/bank',
  asyncRoute(async (req, r) => {
    const payerId = String(req.body?.payerId ?? state.payerId ?? '')
    if (!payerId) throw new Error('No payerId — create a payer first.')
    const pm = await r.payers.attachPayByBank(payerId, undefined, { is_default: true })
    return { data: pm }
  }),
)

app.post(
  '/api/payin/create',
  asyncRoute(async (req, r) => {
    const payerId = String(req.body?.payerId ?? state.payerId ?? '')
    if (!payerId) throw new Error('No payerId — create a payer first.')
    const amount_in_cents = Number(req.body?.amount_in_cents ?? 1000)
    const rail = String(req.body?.rail ?? 'standard_ach')
    const subaccount_id = req.body?.subaccount_id
      ? String(req.body.subaccount_id)
      : state.subaccountId ?? (await r.subaccounts.getOrCreateDefault()).id
    if (!state.subaccountId) state.subaccountId = subaccount_id
    const payin = await r.payins.create({
      payer_id: payerId,
      amount_in_cents,
      rail,
      subaccount_id,
    })
    state.payinId = payin.id
    return { data: payin }
  }),
)

app.get(
  '/api/payin/last',
  asyncRoute(async (_req, r) => {
    const id = state.payinId
    if (!id) throw new Error('No payin id yet — create a payin first.')
    const payin = await r.payins.get(id)
    return { data: payin }
  }),
)

app.get(
  '/api/payin/:id',
  asyncRoute(async (req, r) => {
    const id = String(req.params.id ?? '')
    if (!id || id === 'last') throw new Error('No payin id.')
    const payin = await r.payins.get(id)
    return { data: payin }
  }),
)

app.post(
  '/api/payin/poll',
  asyncRoute(async (req, r) => {
    const id = String(req.body?.payinId ?? state.payinId ?? '')
    if (!id) throw new Error('No payinId — create a payin first.')
    const rail = String(req.body?.rail ?? 'standard_ach')
    const final = await r.payins.waitForTerminal(id, { rail })
    return { data: final }
  }),
)

function startupCredentialCheck() {
  const raw = process.env.ROOT_API_KEY ?? ''
  const key = sanitizeApiKey(raw)
  // eslint-disable-next-line no-console
  console.log(
    '[test-app] ROOT_BASE_URL=',
    process.env.ROOT_BASE_URL ?? '(unset → default https://api.useroot.com)',
  )
  // eslint-disable-next-line no-console
  console.log('[test-app] API key (masked):', describeApiKeyForLogs(key))
  if (!key) {
    // eslint-disable-next-line no-console
    console.error(
      '[test-app] ROOT_API_KEY is missing — set it in test-app/.env or repo-root .env',
    )
    process.exit(1)
  }
  const hint = apiKeyFormatHint(key)
  if (hint) {
    // eslint-disable-next-line no-console
    console.error('[test-app]', hint)
    process.exit(1)
  }
  if (debugRequests) {
    // eslint-disable-next-line no-console
    console.log('[test-app] ROOT_SDK_DEBUG=1 — logging every Root HTTP call')
  }
}

startupCredentialCheck()

app.listen(PORT, () => {
  try {
    const root = getRoot()
    // eslint-disable-next-line no-console
    console.log('')
    // eslint-disable-next-line no-console
    console.log(
      '[test-app] Local UI (open in browser) — NOT the Root API host:',
      `http://127.0.0.1:${PORT}`,
    )
    // eslint-disable-next-line no-console
    console.log(
      '[test-app] Root API base (from ROOT_BASE_URL / SDK default):',
      root.client.baseUrlOrigin,
    )
    // eslint-disable-next-line no-console
    console.log('')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[test-app] Root client init failed:', e?.message ?? e)
    process.exit(1)
  }
})
