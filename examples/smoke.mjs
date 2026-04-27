// Smoke test for the built bundle. Run with `node examples/smoke.mjs`.
// Verifies imports, constructor behavior, and the mocked end-to-end flow
// without requiring a real ROOT_API_KEY.

import assert from 'node:assert/strict'
import {
  ALLOWED_TEST_ACCOUNT_NUMBERS,
  ALLOWED_TEST_CARD_NUMBERS,
  ALLOWED_TEST_ROUTING_NUMBERS,
  DEFAULT_BASE_URL,
  DEFAULT_TEST_BANK,
  FAILURE_SIMULATION_NAME,
  RAIL_POLLING,
  Root,
  RootApiError,
  RootClient,
  RootPollTimeoutError,
  collectAll,
  createRoot,
  isSuccess,
  isTerminal,
  paginate,
  payeeNameForTransaction,
  statusLabel,
  terminalForRail,
  waitForTerminal,
} from '../dist/index.js'

console.log('▸ exports OK')
assert.equal(typeof Root, 'function')
assert.equal(typeof createRoot, 'function')
assert.equal(typeof RootClient, 'function')
assert.equal(typeof RootApiError, 'function')
assert.equal(typeof RootPollTimeoutError, 'function')
assert.equal(typeof waitForTerminal, 'function')
assert.equal(typeof paginate, 'function')
assert.equal(typeof collectAll, 'function')

console.log('▸ constants OK')
assert.equal(DEFAULT_BASE_URL, 'https://api.useroot.com')
assert.equal(FAILURE_SIMULATION_NAME, 'John Failed')
assert.equal(ALLOWED_TEST_ACCOUNT_NUMBERS.length, 4)
assert.equal(ALLOWED_TEST_ROUTING_NUMBERS.length, 4)
assert.equal(ALLOWED_TEST_CARD_NUMBERS.length, 4)
assert.equal(DEFAULT_TEST_BANK.routing_number_type, 'aba')
assert.equal(RAIL_POLLING.instant_bank.intervalMs, 1500)
assert.equal(RAIL_POLLING.standard_ach.timeoutMs, 90_000)
assert.equal(RAIL_POLLING.wire.timeoutMs, 180_000)

console.log('▸ status helpers OK')
assert.equal(statusLabel('initiated'), 'Sent to bank')
assert.equal(statusLabel('debited'), 'Paid')
assert.equal(statusLabel('failed'), 'Failed')
assert.equal(isTerminal('settled'), true)
assert.equal(isTerminal('processing'), false)
assert.equal(isSuccess('debited'), true)
assert.equal(isSuccess('failed'), false)
assert.equal(terminalForRail('standard_ach'), 'debited')
assert.equal(terminalForRail('instant_bank'), 'settled')
assert.equal(terminalForRail('standard_ach', 'payin'), 'settled')

console.log('▸ payeeNameForTransaction OK')
assert.equal(payeeNameForTransaction('Quinn', false), 'Quinn')
assert.equal(payeeNameForTransaction('Quinn', true), 'John Failed')

console.log('▸ Root constructor throws without apiKey')
delete process.env.ROOT_API_KEY
try {
  new Root()
  throw new Error('expected throw')
} catch (err) {
  assert.match(err.message, /Missing apiKey/)
}

console.log('▸ Root constructor rejects bare UUID (not a full API token)')
try {
  new Root({ apiKey: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
  throw new Error('expected throw')
} catch (err) {
  assert.match(err.message, /bare UUID|full API token/i)
}

console.log('▸ end-to-end with mocked fetch')
const calls = []
const fakeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`
const state = {
  payees: new Map(),
  payeeByEmail: new Map(),
  paymentMethods: new Map(),
  subaccounts: new Map(),
  payouts: new Map(),
  pollCount: 0,
}

const okJSON = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const mockFetch = async (url, init) => {
  const u = new URL(url)
  const path = u.pathname
  const body = init?.body ? JSON.parse(init.body) : undefined
  const method = init?.method ?? 'GET'
  calls.push({ method, path, body })

  if (method === 'GET' && path === '/api/subaccounts') {
    return okJSON({ data: [], has_more: false, next_cursor: null })
  }
  if (method === 'POST' && path === '/api/subaccounts/') {
    const id = fakeId('sub')
    const sub = { id, name: body.name }
    state.subaccounts.set(id, sub)
    return okJSON({ data: sub })
  }
  if (method === 'GET' && /^\/api\/subaccounts\/[^/]+$/.test(path)) {
    const id = path.split('/').pop()
    return okJSON({ data: state.subaccounts.get(id) })
  }

  if (method === 'GET' && path === '/api/payees') {
    const email = u.searchParams.get('email')
    const hit = email ? state.payeeByEmail.get(email.toLowerCase()) : undefined
    return okJSON({ data: hit ? [hit] : [], has_more: false, next_cursor: null })
  }
  if (method === 'POST' && path === '/api/payees/') {
    const id = fakeId('payee')
    const payee = { id, name: body.name, email: body.email, metadata: body.metadata ?? {} }
    state.payees.set(id, payee)
    state.payeeByEmail.set(body.email.toLowerCase(), payee)
    return okJSON({ data: payee }, 201)
  }
  if (method === 'POST' && /\/payment-methods\/pay-to-bank$/.test(path)) {
    const payeeId = path.split('/')[3]
    const pm = {
      id: fakeId('pm'),
      payee_id: payeeId,
      account_last_four: body.account_number.slice(-4),
      routing_number: body.routing_number,
      verification_status: 'verified',
      is_default: true,
    }
    state.paymentMethods.set(pm.id, pm)
    return okJSON({ data: pm }, 201)
  }

  if (method === 'POST' && path === '/api/payouts/') {
    const id = fakeId('po')
    const payout = {
      id,
      payee_id: body.payee_id,
      amount_in_cents: body.amount_in_cents,
      currency_code: body.currency_code,
      rail: body.rail,
      subaccount_id: body.subaccount_id,
      status: 'initiated',
    }
    state.payouts.set(id, payout)
    return okJSON({ data: payout }, 201)
  }
  if (method === 'GET' && /^\/api\/payouts\/[^/]+$/.test(path)) {
    const id = path.split('/').pop()
    state.pollCount++
    const payout = state.payouts.get(id)
    if (state.pollCount === 1) payout.status = 'processing'
    if (state.pollCount >= 2) payout.status = 'settled'
    return okJSON({ data: payout })
  }

  return okJSON({ error: `unmocked ${method} ${path}` }, 404)
}

const root = new Root({
  apiKey: 'test_11111111-1111-1111-1111-111111111111_smoke_secret',
  fetch: mockFetch,
  maxRetries: 0,
})

const result = await root.flows.payTo({
  payee: { name: 'Quinn Ramirez', email: 'quinn+smoke@example.com' },
  amount_in_cents: 4200,
  rail: 'instant_bank',
  // Override the rail-default poll interval so the smoke test stays under 1s.
  // (The flow doesn't expose this directly; we'll simulate by calling waitForTerminal manually next.)
})
assert.equal(result.payee.name, 'Quinn Ramirez')
assert.equal(result.payee.email, 'quinn+smoke@example.com')
assert.equal(result.paymentMethod.payee_id, result.payee.id)
assert.equal(result.payout.amount_in_cents, 4200)
assert.equal(result.finalPayout.status, 'settled')
console.log('   ▸ flows.payTo settled in', state.pollCount, 'polls')

console.log('▸ RootApiError thrown on non-2xx')
const errRoot = new Root({
  apiKey: 'test',
  allowNonStandardApiKey: true,
  maxRetries: 0,
  fetch: async () =>
    new Response(JSON.stringify({ message: 'invalid amount' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    }),
})
try {
  await errRoot.payouts.create({
    payee_id: 'x',
    amount_in_cents: -1,
    rail: 'instant_bank',
  })
  throw new Error('expected throw')
} catch (err) {
  assert.ok(err instanceof RootApiError, 'expected RootApiError')
  assert.equal(err.status, 422)
  assert.match(err.message, /invalid amount/)
}

console.log('\n✓ smoke test passed')
